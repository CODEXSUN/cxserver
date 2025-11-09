<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\Process\Process;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class SystemManagerController extends Controller
{
    public function run(Request $request)
    {
        $request->validate([
            'command' => 'required|string|in:clearCache,clearConfig,clearRoute,clearView,clearLog,runMigration,runMigrationRollback,runMigrationFreshSeed,storageLink,storageUnlink,optimize,clearAll,gitPull,gitStatus,gitRemote',
        ]);

        $command = $request->input('command');

        if (!auth()->user()->can('system.manage')) {
            return Inertia::render('SystemManager/Index', [
                'error' => 'Unauthorized.',
                'can'   => ['manage' => false],
            ]);
        }

        $output = $this->execute($command);

        return Inertia::render('SystemManager/Index', [
            'output' => $output,
            'can'    => ['manage' => true],
        ]);
    }

    private function execute(string $command): string
    {
        return match ($command) {
            'clearCache'           => $this->artisan('cache:clear'),
            'clearConfig'          => $this->artisan('config:clear'),
            'clearRoute'           => $this->artisan('route:clear'),
            'clearView'            => $this->artisan('view:clear'),
            'clearLog'             => $this->clearLogs(),
            'runMigration'         => $this->artisan('migrate'),
            'runMigrationRollback' => $this->artisan('migrate:rollback'),
            'runMigrationFreshSeed'=> $this->artisan('migrate:fresh --seed'),
            'storageLink'          => $this->artisan('storage:link'),
            'storageUnlink'        => $this->artisan('storage:unlink'),
            'optimize'             => $this->artisan('optimize'),
            'clearAll'             => $this->clearAll(),
            'gitPull'              => $this->gitPull(),
            'gitStatus'            => $this->gitStatus(),
            'gitRemote'            => $this->gitRemote(),
            default                => 'Unknown command.',
        };
    }

    // ─────────────────────────────────────────────────────────────────────
    // Artisan Helpers
    // ─────────────────────────────────────────────────────────────────────
    private function artisan(string $cmd): string
    {
        Artisan::call($cmd);
        return trim(Artisan::output()) ?: 'Done.';
    }

    private function clearLogs(): string
    {
        $files = File::glob(storage_path('logs/*.log'));
        $cnt   = count($files);
        File::delete($files);
        return "Deleted {$cnt} log file(s).";
    }

    private function clearAll(): string
    {
        Artisan::call('optimize:clear');
        $out = trim(Artisan::output());

        $files = File::glob(storage_path('logs/*.log'));
        $cnt   = count($files);
        File::delete($files);

        return $out . "\nLogs cleared: {$cnt} file(s).";
    }


// ─────────────────────────────────────────────────────────────────────
// Git: Basic pull from root (origin/main or origin/master)
// ─────────────────────────────────────────────────────────────────────
    private function gitPull(): string
    {
        $basePath = base_path();
        $gitDir   = $basePath . '/.git';

        // 1. Must be a Git repo
        if (!is_dir($gitDir)) {
            return 'ERROR: Not a Git repository. Missing .git folder.';
        }

        // 2. Find the remote (first one, usually "origin")
        $remote = trim(shell_exec('git remote | head -n1') ?: 'origin');

        // 3. Guess branch – try main → master → current
        $branch = 'main';
        if (!trim(shell_exec("git show-ref --verify --quiet refs/heads/{$branch}"))) {
            $branch = 'master';
            if (!trim(shell_exec("git show-ref --verify --quiet refs/heads/{$branch}"))) {
                $branch = trim(shell_exec('git rev-parse --abbrev-ref HEAD') ?: 'main');
            }
        }

        // 4. Pull
        $process = new Process(['git', 'pull', $remote, $branch]);
        $process->setWorkingDirectory($basePath);
        $process->setTimeout(180);
        $process->run();

        $out = trim($process->getOutput());
        $err = trim($process->getErrorOutput());

        return $process->isSuccessful()
            ? ($out ?: 'Already up to date.')
            : "ERROR: {$err}";
    }

    private function gitStatus(): string
    {
        $process = new Process(['git', 'status', '--short']);
        $process->setWorkingDirectory(base_path());
        $process->run();

        return $process->isSuccessful()
            ? trim($process->getOutput()) ?: 'Nothing to commit, working tree clean.'
            : 'ERROR: ' . trim($process->getErrorOutput());
    }

    private function gitRemote(): string
    {
        $remote = trim(shell_exec('git remote') ?: '');
        if (!$remote) {
            return 'No remote configured.';
        }

        $url = trim(shell_exec('git remote get-url ' . $remote) ?: '');
        $branch = trim(shell_exec('git rev-parse --abbrev-ref HEAD') ?: '');

        return "Remote: {$remote}\nURL: {$url}\nBranch: {$branch}";
    }
}
