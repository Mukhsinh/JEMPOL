import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    name?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`ErrorBoundary caught an error in ${this.props.name || 'Component'}:`, error, errorInfo);
        this.setState({ errorInfo });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-red-100 dark:border-red-900 shadow-sm">
                    <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-full mb-4">
                        <span className="material-symbols-outlined text-4xl text-red-500">error_outline</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Terjadi Kesalahan
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                        Maaf, terjadi kesalahan saat memuat komponen {this.props.name || 'ini'}.
                        Silakan coba muat ulang halaman.
                    </p>

                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg w-full max-w-lg mb-6 text-left overflow-auto max-h-40 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-mono text-red-600 dark:text-red-400 break-words">
                            {this.state.error?.toString()}
                        </p>
                    </div>

                    <button
                        onClick={this.handleRetry}
                        className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">refresh</span>
                        Muat Ulang Halaman
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
