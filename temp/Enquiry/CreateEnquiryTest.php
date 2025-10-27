<?php

namespace Tests\Feature\Enquiry;

use App\Models\User;
use App\Models\Contact;
use App\Models\Enquiry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CreateEnquiryTest extends TestCase
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
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $this->token = $response->json('token');
        $this->actingAs($this->admin);
    }

    public function test_can_create_enquiry_for_contact_via_api()
    {
        $contact = Contact::factory()->create([
            'contact_code' => 'CON-2025-0001',
            'name' => 'Jane Smith',
            'phone' => '+1987654321',
            'contact_type' => 'customer',
        ]);

        $payload = [
            'contact_id' => $contact->id,
            'query' => 'Interested in web development services. Need quote for e-commerce site.',
            'status' => 'open',
            'tags' => ['cold-call', 'high-priority'],
        ];

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/enquiries', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'contact' => ['id', 'name', 'phone'],
                    'query',
                    'status',
                    'resolved_at',
                    'tags',
                    'sla_tickets',
                    'created_at',
                ],
            ]);

        $this->assertDatabaseHas('enquiries', [
            'contact_id' => $contact->id,
            'query' => $payload['query'],
            'status' => 'open',
            'deleted_at' => null,
        ]);

        $enquiry = Enquiry::first();
        $this->assertEquals(['cold-call', 'high-priority'], $enquiry->tags);

        $this->assertDatabaseHas('sla_tickets', [
            'ticketable_type' => Enquiry::class,
            'ticketable_id' => $enquiry->id,
            'contact_id' => $contact->id,
            'type' => 'response',
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('activities', [
            'user_id' => $this->admin->id,
            'subject_type' => Enquiry::class,
            'subject_id' => $enquiry->id,
            'action' => 'created',
        ]);
    }

    public function test_can_soft_delete_enquiry_via_api()
    {
        $contact = Contact::factory()->create();
        $enquiry = Enquiry::factory()->create([
            'contact_id' => $contact->id,
            'query' => 'Test enquiry to delete',
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->deleteJson("/api/enquiries/{$enquiry->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Enquiry deleted']);

        $this->assertSoftDeleted('enquiries', [
            'id' => $enquiry->id,
            'query' => 'Test enquiry to delete',
        ]);

        $this->assertDatabaseHas('activities', [
            'user_id' => $this->admin->id,
            'subject_type' => Enquiry::class,
            'subject_id' => $enquiry->id,
            'action' => 'deleted',
        ]);
    }

    public function test_can_restore_soft_deleted_enquiry()
    {
        $contact = Contact::factory()->create();
        $enquiry = Enquiry::factory()->create(['contact_id' => $contact->id]);
        $enquiry->delete();

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson("/api/enquiries/{$enquiry->id}/restore");

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Enquiry restored']);

        $this->assertDatabaseHas('enquiries', [
            'id' => $enquiry->id,
            'deleted_at' => null,
        ]);

        $this->assertDatabaseHas('activities', [
            'user_id' => $this->admin->id,
            'subject_type' => Enquiry::class,
            'subject_id' => $enquiry->id,
            'action' => 'restored',
        ]);
    }

    public function test_enquiry_creation_fails_without_contact_id()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/enquiries', [
            'query' => 'Missing contact',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['contact_id']);
    }

    public function test_unauthorized_user_cannot_create_enquiry()
    {
        $contact = Contact::factory()->create();

        $response = $this->postJson('/api/enquiries', [
            'contact_id' => $contact->id,
            'query' => 'Test',
        ]);

        $response->assertStatus(401);
    }
}
