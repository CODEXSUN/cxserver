<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Support\Collection;

class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable,SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'active',
    ];
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'active'            => 'boolean',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    public function permissions(): Collection
    {
        return $this->roles()
            ->with('permissions')
            ->get()
            ->pluck('permissions')
            ->flatten()
            ->pluck('name')
            ->unique();
    }

    public function hasPermissionTo(string $permission): bool
    {
        return $this->permissions()->contains($permission);
    }

    public function hasRole($role): bool
    {
        if (is_array($role)) {
            return $this->roles->pluck('name')->intersect($role)->isNotEmpty();
        }
        return $this->roles->pluck('name')->contains($role);
    }

    public function hasPermission($permission): bool
    {
        return $this->permissions()->contains($permission);
    }

    public function assignRole(...$roles): static
    {
        $roles = collect($roles)->flatten()->map(function ($role) {
            if ($role instanceof Role) {
                return $role;
            }

            // Find existing role (fail if not found)
            return Role::where('name', $role)
                ->where('guard_name', 'web')
                ->firstOrFail();
        });

        $this->roles()->syncWithoutDetaching($roles->pluck('id')->all());

        return $this;
    }

    public function removeRole(...$roleNames): void
    {
        $roles = Role::whereIn('name', $roleNames)->pluck('id');
        $this->roles()->detach($roles);
    }

    public function syncRoles($roleNames): void
    {
        $roles = Role::whereIn('name', $roleNames)->pluck('id');
        $this->roles()->sync($roles);
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}
