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

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'active'            => 'boolean',
        ];
    }

    /**
     * Get the roles that belong to the user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    /**
     * Get all permissions the user has via roles.
     *
     * @return \Illuminate\Support\Collection<int, string>
     */
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

    /**
     * Check if the user has a specific permission.
     */
    public function hasPermissionTo(string $permission): bool
    {
        return $this->permissions()->contains($permission);
    }

    /**
     * Check if the user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->roles()->where('name', $role)->exists();
    }

    /**
     * Assign one or more roles to the user.
     *
     * @param  mixed  ...$roles  Role name(s) or Role model(s)
     * @return $this
     */
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

    /**
     * Scope: active users only.
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}
