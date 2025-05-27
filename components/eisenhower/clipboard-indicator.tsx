"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Clipboard } from 'lucide-react';

interface ClipboardIndicatorProps {
    isVisible: boolean;
    isLoading?: boolean;
    message?: string;
}

export function ClipboardIndicator({
    isVisible,
    isLoading = false,
    message = "Pasting from clipboard..."
}: ClipboardIndicatorProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="fixed bottom-4 right-4 z-50"
                >
                    <div className="bg-background border border-blue-200 rounded-lg shadow-lg p-3 flex items-center gap-3 max-w-sm">
                        <div className="flex-shrink-0">
                            {isLoading ? (
                                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                            ) : (
                                <Check className="h-4 w-4 text-green-500" />
                            )}
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                            <Clipboard className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900 truncate">
                                {message}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
} 