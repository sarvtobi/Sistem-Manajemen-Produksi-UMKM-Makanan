<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Umkm extends Model
{
    use HasFactory;

    protected $table = 'umkms';

    protected $fillable = [
        'name',
        'address',
        'phone',
        'owner_id',
    ];

    /**
     * UMKM dimiliki oleh satu owner.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * UMKM memiliki banyak staff.
     */
    public function staffs(): HasMany
    {
        return $this->hasMany(User::class, 'umkm_id')->where('role', User::ROLE_STAFF);
    }
}
