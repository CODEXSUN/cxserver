<?php
// tests/Feature/EnquiryApiTest.php

namespace Tests\Feature\Enquiry;

use App\Models\Contact;
use App\Models\Enquiry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnquiryApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $manager;
    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\UserRABCSeeder::class);
        $this->seed(\Database\Seeders\EnquiryRABCSeeder::class);

        $this->admin = User::where('email', 'admin@admin.com')
            ->with('roles.permissions')
            ->first();

        $this->manager = User::where('email', 'manager@manager.com')
            ->with('roles.permissions')
            ->first();

        $this->regularUser = User::where('email', 'restricted@codexsun.com')
            ->with('roles.permissions')
            ->first();
    }

    public function test_1_admin_can_list_enquiries_paginated()
    {
        $contact = Contact::factory()->create();
        Enquiry::factory()->count(25)->create(['contact_id' => $contact->id]);

        $response = $this->actingAs($this->admin)->getJson('/api/enquiries?per_page=10');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [['id', 'query', 'status', 'contact', 'sla_ticket_count']],
                'meta' => ['current_page', 'last_page', 'per_page', 'total']
            ])
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonCount(10, 'data');
    }

    public function test_2_manager_can_list_enquiries()
    {
        $response = $this->actingAs($this->manager)->getJson('/api/enquiries');
        $response->assertStatus(200);
    }

    public function test_3_regular_user_cannot_list_enquiries()
    {
        $response = $this->actingAs($this->regularUser)->getJson('/api/enquiries');
        $response->assertStatus(403);
    }

    public function test_4_admin_can_create_enquiry()
    {
        $contact = Contact::factory()->create();

        $payload = [
            'contact_id' => $contact->id,
            'query'      => 'Need quotation for 50 units',
            'tags'       => ['urgent', 'quotation'],
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/enquiries', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.query', $payload['query'])
            ->assertJsonPath('data.contact.id', $contact->id);

        $this->assertDatabaseHas('enquiries', [
            'contact_id' => $contact->id,
            'query'      => $payload['query'],
        ]);
    }

    public function test_5_manager_can_create_enquiry()
    {
        $contact = Contact::factory()->create();

        $payload = [
            'contact_id' => $contact->id,
            'query'      => 'Follow up on previous order',
        ];

        $response = $this->actingAs($this->manager)->postJson('/api/enquiries', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('enquiries', ['query' => $payload['query']]);
    }

    public function test_6_regular_user_cannot_create_enquiry()
    {
        $contact = Contact::factory()->create();

        $payload = [
            'contact_id' => $contact->id,
            'query'      => 'Hacked enquiry',
        ];

        $response = $this->actingAs($this->regularUser)->postJson('/api/enquiries', $payload);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('enquiries', ['query' => $payload['query']]);
    }

    public function test_7_admin_can_view_enquiry_with_sla_count()
    {
        $enquiry = Enquiry::factory()->create();
        $enquiry->slaTickets()->create([
            'status' => 'active', // ← Match enum
            'due_at' => now()->addDay(),
            'time_limit_minutes' => 1440,
        ]);

        $response = $this->actingAs($this->admin)->getJson("/api/enquiries/{$enquiry->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.sla_ticket_count', 1);
    }

    public function test_8_manager_can_view_enquiry()
    {
        $enquiry = Enquiry::factory()->create();

        $response = $this->actingAs($this->manager)->getJson("/api/enquiries/{$enquiry->id}");
        $response->assertStatus(200);
    }

    public function test_9_regular_user_cannot_view_enquiry()
    {
        $enquiry = Enquiry::factory()->create();

        $response = $this->actingAs($this->regularUser)->getJson("/api/enquiries/{$enquiry->id}");
        $response->assertStatus(403);
    }

    public function test_10_admin_can_update_enquiry()
    {
        $enquiry = Enquiry::factory()->create();

        $response = $this->actingAs($this->admin)->putJson("/api/enquiries/{$enquiry->id}", [
            'query' => 'Updated: Need 100 units'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('enquiries', [
            'id' => $enquiry->id,
            'query' => 'Updated: Need 100 units'
        ]);
    }

    public function test_11_manager_can_update_enquiry()
    {
        $enquiry = Enquiry::factory()->create();

        $response = $this->actingAs($this->manager)->putJson("/api/enquiries/{$enquiry->id}", [
            'tags' => ['follow-up', 'priority']
        ]);

        $response->assertStatus(200);
    }

    public function test_12_regular_user_cannot_update_enquiry()
    {
        $enquiry = Enquiry::factory()->create();

        $response = $this->actingAs($this->regularUser)->putJson("/api/enquiries/{$enquiry->id}", [
            'query' => 'Hacked'
        ]);

        $response->assertStatus(403);
    }

    public function test_13_admin_can_delete_enquiry()
    {
        $enquiry = Enquiry::factory()->create();

        $response = $this->actingAs($this->admin)->deleteJson("/api/enquiries/{$enquiry->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Enquiry deleted']);

        $this->assertSoftDeleted('enquiries', ['id' => $enquiry->id]);
    }

    public function test_14_manager_cannot_delete_enquiry()
    {
        $enquiry = Enquiry::factory()->create();

        $response = $this->actingAs($this->manager)->deleteJson("/api/enquiries/{$enquiry->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('enquiries', ['id' => $enquiry->id]);
    }

    public function test_15_admin_can_restore_enquiry()
    {
        $enquiry = Enquiry::factory()->create();
        $enquiry->delete();

        $response = $this->actingAs($this->admin)->postJson("/api/enquiries/{$enquiry->id}/restore");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Enquiry restored']);

        $this->assertDatabaseHas('enquiries', ['id' => $enquiry->id, 'deleted_at' => null]);
    }

    public function test_16_manager_cannot_restore_enquiry()
    {
        $enquiry = Enquiry::factory()->create();
        $enquiry->delete();

        $response = $this->actingAs($this->manager)->postJson("/api/enquiries/{$enquiry->id}/restore");

        $response->assertStatus(403);
    }

    public function test_17_admin_can_resolve_enquiry()
    {
        $enquiry = Enquiry::factory()->create(['status' => 'open']);

        $response = $this->actingAs($this->admin)->postJson("/api/enquiries/{$enquiry->id}/resolve");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'resolved');

        $this->assertDatabaseHas('enquiries', [
            'id' => $enquiry->id,
            'status' => 'resolved'
        ]);
    }

    public function test_18_manager_can_resolve_enquiry()
    {
        $enquiry = Enquiry::factory()->create(['status' => 'in_progress']);

        $response = $this->actingAs($this->manager)->postJson("/api/enquiries/{$enquiry->id}/resolve");

        $response->assertStatus(200);
    }

// Test 19
    public function test_19_admin_can_convert_enquiry_to_project()
    {
        $enquiry = Enquiry::factory()->create();

        $response = $this->actingAs($this->admin)->postJson("/api/enquiries/{$enquiry->id}/convert-to-project", [
            'title' => 'New Project from Enquiry',
            'estimated_value' => 5000
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'New Project from Enquiry')
            ->assertJsonPath('data.enquiry_id', $enquiry->id);

        $this->assertDatabaseHas('projects', ['enquiry_id' => $enquiry->id]);
    }
    public function test_20_filter_enquiries_by_status()
    {
        Enquiry::factory()->create(['status' => 'resolved']);
        Enquiry::factory()->count(2)->create(['status' => 'open']);

        $response = $this->actingAs($this->admin)->getJson('/api/enquiries?filter[status]=resolved');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'resolved');
    }

    public function test_21_search_enquiries_by_query_or_contact_name()
    {
        $contact = Contact::factory()->create(['name' => 'Alice Johnson']);
        Enquiry::factory()->create(['contact_id' => $contact->id, 'query' => 'Need 100 units']);

        $response = $this->actingAs($this->admin)->getJson('/api/enquiries?search=Alice');
        $response->assertStatus(200)
            ->assertJsonPath('data.0.contact.name', 'Alice Johnson');

        $response = $this->actingAs($this->admin)->getJson('/api/enquiries?search=100 units');
        $response->assertStatus(200)
            ->assertJsonPath('data.0.query', 'Need 100 units');
    }
}
