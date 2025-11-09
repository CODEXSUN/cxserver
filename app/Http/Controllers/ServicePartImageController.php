<?php

namespace App\Http\Controllers;

use App\Models\ServicePart;
use App\Models\ServicePartImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;   // or Imagick\Driver
//use Intervention\Image\Drivers\Imagick\Driver;

class ServicePartImageController extends Controller
{
    /** @var ImageManager */
    protected $manager;

    public function __construct()
    {
        // Choose GD (default) or Imagick
        $this->manager = new ImageManager(new Driver());
    }

    public function store(Request $request, ServicePart $servicePart)
    {
        $request->validate([
            'images.*' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
            'images'   => 'required|array|min:1',
        ]);

        $uploaded = [];

        foreach ($request->file('images') as $file) {
            $uuid   = Str::uuid();
            $ext    = $file->getClientOriginalExtension();
            $filename = $uuid . '.' . $ext;
            $thumbname = $uuid . '_thumb.' . $ext;

            // ── ORIGINAL ─────────────────────────────────────
            $originalPath = $file->storeAs('service-parts', $filename, 'public');

            // ── THUMBNAIL (300×300) ───────────────────────
            $thumbPath = 'service-parts/thumbs/' . $thumbname;

            $image = $this->manager->read($file);
            $image->cover(300, 300);               // keep aspect ratio, crop to fit
            Storage::disk('public')->put($thumbPath, (string) $image->encode());

            $dbImage = $servicePart->images()->create([
                'image_path' => $originalPath,
                'thumb_path' => $thumbPath,
                'alt_text'   => $request->input('alt_text'),
                'sort_order' => $servicePart->images()->max('sort_order') + 1,
            ]);

            // First first image → primary
            if ($servicePart->images()->count() === 1) {
                $dbImage->update(['is_primary' => true]);
            }

            $uploaded[] = $dbImage;
        }

        return back()->with('success', count($uploaded) . ' image(s) uploaded.');
    }

    public function setPrimary(ServicePartImage $image)
    {
        $image->servicePart->images()->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);

        return back()->with('success', 'Primary image updated.');
    }

    public function destroy(ServicePartImage $image)
    {
        Storage::disk('public')->delete([$image->image_path, $image->thumb_path]);
        $image->delete();

        $part = $image->servicePart;
        if ($part->images()->where('is_primary', true)->doesntExist() && $part->images()->exists()) {
            $part->images()->first()->update(['is_primary' => true]);
        }

        return back()->with('success', 'Image deleted.');
    }

    public function reorder(Request $request, ServicePart $servicePart)
    {
        $request->validate([
            'order' => 'required|array',
            'order.*' => 'integer|exists:service_part_images,id',
        ]);

        foreach ($request->order as $index => $id) {
            ServicePartImage::where('id', $id)
                ->where('service_part_id', $servicePart->id)
                ->update(['sort_order' => $index + 1]);
        }

        return response()->json(['message' => 'Order saved.']);
    }
}
