<?php


namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'roles' => $this->whenLoaded('roles', function () {
                return $this->roles->map(fn($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                ])->values();
            }),
        ];
    }
}
