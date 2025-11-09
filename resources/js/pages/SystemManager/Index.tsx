// resources/js/Pages/SystemManager/Index.tsx
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Loader2,
    Terminal,
    GitPullRequest,
    Trash2,
    RefreshCw,
    Zap,
} from 'lucide-react';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

interface Props {
    output?: string;
    error?: string;
    can: { manage: boolean };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'System Manager', href: '#' },
];

export default function SystemManager() {
    const { output: initialOutput = '', error: initialError, can } = usePage().props as Props;

    const [output, setOutput] = useState(initialOutput);
    const [loading, setLoading] = useState(false);
    const [lastAction, setLastAction] = useState<string | null>(null);

    // ------------------------------------------------------------------ //
    // Helper: append line with timestamp
    // ------------------------------------------------------------------ //
    const appendOutput = (text: string) => {
        const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
        setOutput((prev) => `${prev}${prev ? '\n' : ''}[${ts}] ${text}`);
    };

    // ------------------------------------------------------------------ //
    // Run a command – **POST** only, never GET
    // ------------------------------------------------------------------ //
    const runCommand = (command: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!can.manage || loading) return;

        setLoading(true);
        setLastAction(command);
        appendOutput(`Running: ${command}...`);

        router.post(
            route('system.manager.command'),
            { command },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['output', 'error', 'can'],          // <-- critical
                onSuccess: (page: any) => {
                    const { output: newOut, error: newErr } = page.props;
                    if (newOut) appendOutput(newOut);
                    if (newErr) appendOutput(`ERROR: ${newErr}`);
                },
                onError: (errors: any) => {
                    const msg = errors.command ?? errors.error ?? 'Validation failed';
                    appendOutput(`ERROR: ${msg}`);
                },
                onFinish: () => {
                    setLoading(false);
                    setLastAction(null);
                },
            },
        );
    };

    const clearOutput = () => setOutput('');

    // ------------------------------------------------------------------ //
    // Command definitions
    // ------------------------------------------------------------------ //
    const quickActions = [
        { label: 'Clear All Caches', command: 'clearAll', icon: Zap, color: 'bg-purple-600' },
        { label: 'Git Pull', command: 'gitPull', icon: GitPullRequest, color: 'bg-indigo-600' },
        { label: 'Optimize', command: 'optimize', icon: RefreshCw, color: 'bg-green-600' },
    ];

    const cacheCommands = [
        { label: 'Clear Cache', command: 'clearCache' },
        { label: 'Clear Config', command: 'clearConfig' },
        { label: 'Clear Route', command: 'clearRoute' },
        { label: 'Clear View', command: 'clearView' },
    ];

    const migrationCommands = [
        { label: 'Migrate', command: 'runMigration', color: 'text-green-600' },
        { label: 'Rollback', command: 'runMigrationRollback', color: 'text-orange-600' },
        { label: 'Fresh + Seed', command: 'runMigrationFreshSeed', color: 'text-red-600' },
    ];

    const storageCommands = [
        { label: 'Storage Link', command: 'storageLink' },
        { label: 'Storage Unlink', command: 'storageUnlink' },
        { label: 'Clear Logs', command: 'clearLog' },
    ];

    const gitCommands = [
        { label: 'Git Status', command: 'gitStatus' },
        { label: 'Git Pull', command: 'gitPull' },
    ];

    // ------------------------------------------------------------------ //
    // Render
    // ------------------------------------------------------------------ //
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Manager" />

            <div className="py-6">
                <div className="mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-black/80">
                                System Manager
                            </h1>
                            <p className="mt-1 text-sm text-black/50">
                                One-click DevOps: Cache, DB, Storage, Git & Logs
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearOutput}
                                disabled={loading}
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Clear Log
                            </Button>

                            <Button
                                variant="default"
                                size="sm"
                                onClick={runCommand('clearAll')}
                                disabled={loading || !can.manage}
                            >
                                {loading && lastAction === 'clearAll' ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Zap className="h-4 w-4 mr-2" />
                                )}
                                Clear All
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {quickActions.map((a) => (
                            <Card
                                key={a.command}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={runCommand(a.command)}
                            >
                                <CardHeader className="pb-3">
                                    <div
                                        className={`w-10 h-10 rounded-lg ${a.color} flex items-center justify-center text-white`}
                                    >
                                        <a.icon className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-sm font-medium">{a.label}</CardTitle>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>

                    {/* Command Groups */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                        {/* Cache */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Terminal className="h-4 w-4" />
                                    Cache
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {cacheCommands.map((c) => (
                                    <Button
                                        key={c.command}
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start text-xs"
                                        onClick={runCommand(c.command)}
                                        disabled={loading || !can.manage}
                                    >
                                        {loading && lastAction === c.command && (
                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        )}
                                        {c.label}
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Migration */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold">Migrations</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {migrationCommands.map((c) => (
                                    <Button
                                        key={c.command}
                                        variant="outline"
                                        size="sm"
                                        className={`w-full justify-start text-xs ${c.color ?? ''}`}
                                        onClick={runCommand(c.command)}
                                        disabled={loading || !can.manage}
                                    >
                                        {loading && lastAction === c.command && (
                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        )}
                                        {c.label}
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Storage & Logs */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold">Storage & Logs</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {storageCommands.map((c) => (
                                    <Button
                                        key={c.command}
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start text-xs"
                                        onClick={runCommand(c.command)}
                                        disabled={loading || !can.manage}
                                    >
                                        {loading && lastAction === c.command && (
                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        )}
                                        {c.label}
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Git */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <GitPullRequest className="h-4 w-4" />
                                    Git
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {gitCommands.map((c) => (
                                    <Button
                                        key={c.command}
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start text-xs"
                                        onClick={runCommand(c.command)}
                                        disabled={loading || !can.manage}
                                    >
                                        {loading && lastAction === c.command && (
                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        )}
                                        {c.label}
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Output Terminal */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Terminal className="h-4 w-4" />
                                    Command Output
                                </CardTitle>
                                {loading && (
                                    <Badge variant="secondary" className="animate-pulse">
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        Running...
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs h-64 overflow-y-auto whitespace-pre-wrap border">
                                {output || (
                                    <span className="text-gray-500">
                    Click any button above to run a command...
                  </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permission warning */}
                    {!can.manage && (
                        <Alert>
                            <AlertDescription>
                                You don't have permission to manage system commands.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
