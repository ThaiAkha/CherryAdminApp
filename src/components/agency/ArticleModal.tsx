import React from 'react';
import { Modal } from '../ui/modal';
import Badge from '../ui/badge/Badge';
import Button from '../ui/button/Button';
import { Calendar, User, Clock } from 'lucide-react';

interface Article {
    id: string;
    title: string;
    content: string;
    cover_image_url?: string;
    category?: string;
    created_at: string;
    author?: string;
    reading_time?: string;
}

interface ArticleModalProps {
    article: Article | null;
    isOpen: boolean;
    onClose: () => void;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ article, isOpen, onClose }) => {
    if (!article) return null;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-2xl">
            {/* Cover Image */}
            <div className="relative w-full aspect-video md:aspect-[21/9] shrink-0 overflow-hidden">
                {article.cover_image_url ? (
                    <img
                        src={article.cover_image_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-brand-50 flex items-center justify-center">
                        <span className="text-brand-500 font-black uppercase tracking-widest opacity-20 text-4xl">AKHA NEWS</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 space-y-8">
                {/* Header Info */}
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        {article.category && (
                            <Badge color="primary" variant="solid" className="px-4 py-1.5 text-[10px] uppercase font-black tracking-widest">
                                {article.category}
                            </Badge>
                        )}
                        <Badge color="light" className="px-4 py-1.5 text-[10px] uppercase font-black tracking-widest bg-gray-100 text-gray-500">
                            NEWS
                        </Badge>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 dark:text-gray-100 leading-none">
                        {article.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{formatDate(article.created_at)}</span>
                        </div>
                        {article.author && (
                            <div className="flex items-center gap-2 text-gray-400">
                                <User className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{article.author}</span>
                            </div>
                        )}
                        {article.reading_time && (
                            <div className="flex items-center gap-2 text-gray-400">
                                <Clock className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{article.reading_time}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Body Text */}
                <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-lg md:text-xl font-medium text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                        {article.content}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10 flex justify-end">
                <Button
                    variant="outline"
                    onClick={onClose}
                    className="h-14 px-10 rounded-2xl text-[11px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all active:scale-95"
                >
                    CHIUDI ARTICOLO
                </Button>
            </div>
        </Modal>
    );
};

export default ArticleModal;
