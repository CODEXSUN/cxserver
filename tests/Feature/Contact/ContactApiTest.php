<?php

namespace Tests\Feature\Contact;

use App\Models\Contact;
use App\Models\Enquiry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $manager;
    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\UserRABCSeeder::class);

        $this->admin = User::where('email', 'admin@admin.com')->with('roles.permissions')->first();
        $this->manager = User::where('email', 'manager@manager.com')->with('roles.permissions')->first();
        $this->regularUser = User::where('email', 'user@user.com')->with('roles.permissions')->first();
    }

    public function test_1_admin_can_list_contacts_paginated()
    {
        Contact::factory()->count(25)->create();

        $response = $this->actingAs($this->admin)->getJson('/api/contacts?per_page=10');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [['id', 'contact_code', 'name', 'phone', 'email', 'status', 'enquiry_count']],
                'meta' => ['current_page', 'last_page', 'per_page', 'total']
            ])
            ->assertJsonPath('meta.per_page', 10);
    }

    public function test_2_manager_can_list_contacts()
    {
        $response = $this->actingAs($this->manager)->getJson('/api/contacts');
        $response->assertStatus(200);
    }

    public function test_3_regular_user_cannot_list_contacts()
    {
        $response = $this->actingAs($this->regularUser)->getJson('/api/contacts');
        $response->assertStatus(403);
    }

    public function test_4_admin_can_create_contact()
    {
        $data = [
            'contact_code' => 'CUST-001',
            'name' => 'John Doe',
            'phone' => '+1234567890',
            'email' => 'john@example.com',
            'contact_type' => 'customer',
            'has_account' => false,
            'status' => 'active',
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/contacts', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'John Doe')
            ->assertJsonPath('data.phone', '+1234567890');

        $this->assertDatabaseHas('contacts', ['phone' => '+1234567890']);
    }

    public function test_5_manager_can_create_contact()
    {
        $data = [
            'contact_code' => 'SUP-001',
            'name' => 'Jane Smith',
            'phone' => '+0987654321',
            'contact_type' => 'supplier',
            'status' => 'active',
        ];

        $response = $this->actingAs($this->manager)->postJson('/api/contacts', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('contacts', ['phone' => '+0987654321']);
    }

    public function test_6_regular_user_cannot_create_contact()
    {
        $data = [
            'contact_code' => 'C9999',
            'name' => 'Hacker',
            'phone' => '+1111111111',
            'contact_type' => 'customer',
            'status' => 'active'
        ];

        $response = $this->actingAs($this->regularUser)->postJson('/api/contacts', $data);
        $response->assertStatus(403);
        $this->assertDatabaseMissing('contacts', ['phone' => '+1111111111']);
    }

    public function test_7_admin_can_view_contact_with_enquiry_count()
    {
        $contact = Contact::factory()->create();
        Enquiry::factory()->count(3)->create(['contact_id' => $contact->id]);

        $response = $this->actingAs($this->admin)->getJson("/api/contacts/{$contact->id}");
        $response->assertStatus(200)
            ->assertJsonPath('data.enquiry_count', 3);
    }

    public function test_8_manager_can_view_contact()
    {
        $contact = Contact::factory()->create();

        $response = $this->actingAs($this->manager)->getJson("/api/contacts/{$contact->id}");
        $response->assertStatus(200);
    }

    public function test_9_regular_user_cannot_view_contact()
    {
        $contact = Contact::factory()->create();

        $response = $this->actingAs($this->regularUser)->getJson("/api/contacts/{$contact->id}");
        $response->assertStatus(403);
    }

    public function test_10_admin_can_update_contact()
    {
        $contact = Contact::factory()->create();

        $response = $this->actingAs($this->admin)->putJson("/api/contacts/{$contact->id}", [
            'name' => 'Updated Name'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('contacts', ['id' => $contact->id, 'name' => 'Updated Name']);
    }

    public function test_11_manager_can_update_contact()
    {
        $contact = Contact::factory()->create();

        $response = $this->actingAs($this->manager)->putJson("/api/contacts/{$contact->id}", [
            'email' => 'updated@example.com'
        ]);

        $response->assertStatus(200);
    }

    public function test_12_regular_user_cannot_update_contact()
    {
        $contact = Contact::factory()->create();

        $response = $this->actingAs($this->regularUser)->putJson("/api/contacts/{$contact->id}", [
            'name' => 'Hacked'
        ]);

        $response->assertStatus(403);
    }

    public function test_13_admin_can_delete_contact()
    {
        $contact = Contact::factory()->create();

        $response = $this->actingAs($this->admin)->deleteJson("/api/contacts/{$contact->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Contact deleted']);

        $this->assertSoftDeleted('contacts', ['id' => $contact->id]);
    }

    public function test_14_manager_cannot_delete_contact()
    {
        $contact = Contact::factory()->create();

        $response = $this->actingAs($this->manager)->deleteJson("/api/contacts/{$contact->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('contacts', ['id' => $contact->id]);
    }

    public function test_15_admin_can_restore_deleted_contact()
    {
        $contact = Contact::factory()->create();
        $contact->delete();

        $response = $this->actingAs($this->admin)->postJson("/api/contacts/{$contact->id}/restore");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Contact restored']);

        $this->assertDatabaseHas('contacts', ['id' => $contact->id, 'deleted_at' => null]);
    }

    public function test_16_manager_cannot_restore_contact()
    {
        $contact = Contact::factory()->create();
        $contact->delete();

        $response = $this->actingAs($this->manager)->postJson("/api/contacts/{$contact->id}/restore");

        $response->assertStatus(403);
    }

    public function test_17_filter_contacts_by_status()
    {
        Contact::factory()->create(['status' => 'inactive']);
        Contact::factory()->count(2)->create(['status' => 'active']);

        $response = $this->actingAs($this->admin)->getJson('/api/contacts?filter[status]=inactive');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'inactive');
    }

    public function test_18_search_contacts_by_name_or_phone()
    {
        $contact = Contact::factory()->create(['name' => 'Alice Johnson', 'phone' => '+9998887777']);

        $response = $this->actingAs($this->admin)->getJson('/api/contacts?search=Alice');
        $response->assertStatus(200)
            ->assertJsonPath('data.0.name', 'Alice Johnson');

        $response = $this->actingAs($this->admin)->getJson('/api/contacts?search=+999');
        $response->assertStatus(200)
            ->assertJsonPath('data.0.phone', '+9998887777');
    }
}
