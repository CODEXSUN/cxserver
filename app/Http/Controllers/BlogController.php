<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    use AuthorizesRequests;
    public function index()
    {
        $this->authorize('viewAny', Blog::class);

        $blogs = Blog::with('author')
            ->latest()
            ->paginate(10);

        return Inertia::render('Blogs/Index', [
            'blogs' => $blogs,
            'can' => [
                'create' => auth()->user()->hasPermissionTo('blog.create'),
                'delete' => auth()->user()->hasPermissionTo('blog.delete'),
            ],
            'trashedCount' => Blog::onlyTrashed()->count(),
        ]);
    }

    public function create()
    {
        $this->authorize('create', Blog::class);
        return Inertia::render('Blogs/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', Blog::class);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'published' => 'boolean',
        ]);

        $data['user_id'] = auth()->id();
        $data['slug'] = Str::slug($data['title']);
        $data['published_at'] = $data['published'] ? now() : null;

        Blog::create($data);

        return redirect()->route('blogs.index')->with('success', 'Blog created.');
    }

    public function edit(Blog $blog)
    {
        $this->authorize('update', $blog);
        return Inertia::render('Blogs/Edit', ['blog' => $blog]);
    }

    public function update(Request $request, Blog $blog)
    {
        $this->authorize('update', $blog);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'published' => 'boolean',
        ]);

        $data['slug'] = Str::slug($data['title']);
        $data['published_at'] = $data['published'] ? now() : null;

        $blog->update($data);

        return redirect()->route('blogs.index')->with('success', 'Blog updated.');
    }

    public function destroy(Blog $blog)
    {
        $this->authorize('delete', $blog);
        $blog->delete();
        return back()->with('success', 'Blog moved to trash.');
    }

    public function restore($id)
    {
        $blog = Blog::withTrashed()->findOrFail($id);
        $this->authorize('restore', $blog);
        $blog->restore();
        return back()->with('success', 'Blog restored.');
    }

    public function trash()
    {
        $this->authorize('viewAny', Blog::class);
        $blogs = Blog::onlyTrashed()->with('author')->paginate(10);
        return Inertia::render('Blogs/Trash', ['blogs' => $blogs]);
    }
}
