<?php

// app/Support/helpers.php

if (!function_exists('storage_url')) {
    /**
     * Generate a public URL for a file in the public disk.
     *
     * @param string $path
     * @return string
     */
    function storage_url(string $path): string
    {
        return \Illuminate\Support\Facades\Storage::url($path);
    }
}

if (!function_exists('asset_url')) {
    /**
     * Generate full URL for an asset.
     *
     * @param string $path
     * @return string
     */
    function asset_url(string $path): string
    {
        return asset($path);
    }
}

if (!function_exists('format_currency')) {
    /**
     * Format number as currency (INR by default).
     *
     * @param float|int $amount
     * @param string $currency
     * @return string
     */
    function format_currency($amount, string $currency = 'INR'): string
    {
        return '₹' . number_format((float)$amount, 2);
    }
}

if (!function_exists('format_date')) {
    /**
     * Format datetime for display.
     *
     * @param string|\DateTime $date
     * @param string $format
     * @return string
     */
    function format_date($date, string $format = 'd M Y H:i'): string
    {
        return \Carbon\Carbon::parse($date)->format($format);
    }
}

if (!function_exists('truncate')) {
    /**
     * Truncate string with ellipsis.
     *
     * @param string $string
     * @param int $length
     * @param string $end
     * @return string
     */
    function truncate(string $string, int $length = 50, string $end = '...'): string
    {
        return \Illuminate\Support\Str::limit($string, $length, $end);
    }
}

if (!function_exists('badge_variant')) {
    /**
     * Return Shadcn badge variant based on status.
     *
     * @param string $status
     * @return string
     */
    function badge_variant(string $status): string
    {
        return match (strtolower($status)) {
            'pending' => 'secondary',
            'issued', 'active', 'in_progress' => 'default',
            'completed', 'done' => 'success',
            'cancelled', 'rejected' => 'destructive',
            'customer_will_bring', 'on_hold' => 'outline',
            default => 'secondary',
        };
    }
}

if (!function_exists('human_filesize')) {
    /**
     * Convert bytes to human readable format.
     *
     * @param int $bytes
     * @param int $precision
     * @return string
     */
    function human_filesize(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
