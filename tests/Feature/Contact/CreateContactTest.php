<?php

namespace Tests\Feature\Contact;

use App\Models\User;
use App\Models\Contact;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CreateContactTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'active' => true,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $this->token = $response->json('token');
        $this->actingAs($this->admin);
    }

    public function test_can_create_contact_via_api()
    {
        $payload = [
            'name' => 'John Doe',
            'phone' => '+1234567890',
            'email' => 'john@example.com',
            'contact_type' => 'customer',
            'has_account' => false,
        ];

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/contacts', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'contact_code',
                    'name',
                    'phone',
                    'email',
                    'contact_type',
                    'has_account',
                    'status',
                    'created_at',
                    'updated_at',
                ],
            ]);

        $this->assertDatabaseHas('contacts', [
            'name' => 'John Doe',
            'phone' => '+1234567890',
            'email' => 'john@example.com',
            'contact_type' => 'customer',
            'status' => 'active',
            'deleted_at' => null,
        ]);

        $contact = Contact::first();
        $this->assertNotNull($contact->contact_code);
        $this->assertTrue(str_starts_with($contact->contact_code, 'CON-'));

        $this->assertDatabaseHas('activities', [
            'user_id' => $this->admin->id,
            'subject_type' => Contact::class,
            'subject_id' => $contact->id,
            'action' => 'created',
        ]);
    }

    public function test_can_soft_delete_contact_via_api()
    {
        $contact = Contact::factory()->create([
            'contact_code' => 'CON-2025-0001',
            'name' => 'Delete Me',
            'phone' => '+9999999999',
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->deleteJson("/api/contacts/{$contact->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Contact deleted']);

        $this->assertSoftDeleted('contacts', [
            'id' => $contact->id,
            'name' => 'Delete Me',
        ]);

        $this->assertDatabaseHas('activities', [
            'user_id' => $this->admin->id,
            'subject_type' => Contact::class,
            'subject_id' => $contact->id,
            'action' => 'deleted',
        ]);
    }

    public function test_can_restore_soft_deleted_contact()
    {
        $contact = Contact::factory()->create();
        $contact->delete(); // Soft delete manually

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson("/api/contacts/{$contact->id}/restore");

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Contact restored']);

        $this->assertDatabaseHas('contacts', [
            'id' => $contact->id,
            'deleted_at' => null,
        ]);

        $this->assertDatabaseHas('activities', [
            'user_id' => $this->admin->id,
            'subject_type' => Contact::class,
            'subject_id' => $contact->id,
            'action' => 'restored',
        ]);
    }

    public function test_contact_creation_fails_without_required_fields()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/contacts', [
            'name' => '',
            'phone' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'phone']);
    }

    public function test_unauthorized_user_cannot_create_contact()
    {
        $response = $this->postJson('/api/contacts', [
            'name' => 'Test',
            'phone' => '+1234567890',
        ]);

        $response->assertStatus(401);
    }

    public function test_non_admin_cannot_create_contact()
    {
        $sales = User::factory()->create(['role' => 'sales']);
        $token = $sales->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->postJson('/api/contacts', [
            'name' => 'Test',
            'phone' => '+1234567890',
        ]);

        $response->assertStatus(403);
    }

    public function test_cannot_create_contact_with_duplicate_phone()
    {
        Contact::factory()->create(['phone' => '+1234567890']);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/contacts', [
            'name' => 'Duplicate',
            'phone' => '+1234567890',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }
}
