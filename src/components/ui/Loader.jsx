import { Loader2 } from 'lucide-react';

export default function Loader({ fullScreen = false, size = 'medium', text = 'Loading...' }) {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    const iconSize = sizeClasses[size] || sizeClasses.medium;

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                <Loader2 className={`${iconSize} animate-spin text-primary mb-4`} />
                {text && <p className="text-text-muted font-medium animate-pulse">{text}</p>}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-4">
             <Loader2 className={`${iconSize} animate-spin text-primary mb-2`} />
             {text && <p className="text-sm text-text-muted">{text}</p>}
        </div>
    );
}
