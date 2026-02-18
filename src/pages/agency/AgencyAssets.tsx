import React, { useEffect } from 'react';
import { Link } from 'react-router';
import PageContainer from '../../components/layout/PageContainer';
import Badge from '../../components/ui/badge/Badge';
import {
    Download,
    Image as ImageIcon,
    Film,
    FileText,
    ExternalLink,
    Share2,
    Plus,
    Home,
    TrendingUp
} from 'lucide-react';
import { usePageHeader } from '../../context/PageHeaderContext';
import { contentService } from '../../services/content.service';
import Button from '../../components/ui/button/Button';
import PageMeta from '../../components/common/PageMeta';

const QuickActions = () => (
    <div className="flex items-center gap-2">
        <Link to="/">
            <Button variant="outline" size="sm" startIcon={<Home className="size-4" />} className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-9">Portal</Button>
        </Link>
        <Link to="/agency-dashboard">
            <Button variant="outline" size="sm" startIcon={<TrendingUp className="size-4" />} className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-9">Dashboard</Button>
        </Link>
        <Link to="/agency-booking">
            <Button variant="primary" size="sm" startIcon={<Plus className="size-4" />} className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-9 shadow-lg shadow-brand-500/20">New Booking</Button>
        </Link>
    </div>
);

const AgencyAssets: React.FC = () => {
    const { setPageHeader } = usePageHeader();

    useEffect(() => {
        const loadMeta = async () => {
            const meta = await contentService.getPageMetadata('agency-assets');
            if (meta) {
                setPageHeader(meta.titleMain || 'Asset Hub', meta.description || '', <QuickActions />);
            } else {
                setPageHeader('Asset Hub', 'High-res photos, brochures, and promo videos.', <QuickActions />);
            }
        };
        loadMeta();
    }, [setPageHeader]);

    const ASSETS = [
        { name: 'High-Res Photos', type: 'ZIP/JPG', size: '2.4 GB', icon: <ImageIcon className="w-5 h-5" />, color: 'blue' },
        { name: 'Promo Video (4K)', type: 'MP4', size: '850 MB', icon: <Film className="w-5 h-5" />, color: 'amber' },
        { name: 'Menu Brochure 2026', type: 'PDF', size: '12 MB', icon: <FileText className="w-5 h-5" />, color: 'red' },
        { name: 'Logo KIT (Vector)', type: 'SVG/EPS', size: '4 MB', icon: <ImageIcon className="w-5 h-5" />, color: 'green' },
    ];

    return (
        <PageContainer variant="full">
            <PageMeta
                title="Admin Dashboard | Thai Akha Kitchen"
                description="To be set up later."
            />
            <div className="pb-20 space-y-8">
                <div className="text-left space-y-2 mb-12">
                    <Badge variant="light" color="primary" className="font-black uppercase tracking-widest">Legal Framework</Badge>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">Partner Policies</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Standard operational procedures and conditions for all B2B booking partners.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ASSETS.map((asset, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between h-64">
                            <div className="space-y-4">
                                <div className={`size-12 rounded-2xl bg-${asset.color}-50 dark:bg-${asset.color}-500/10 flex items-center justify-center text-${asset.color}-500 group-hover:scale-110 transition-transform`}>
                                    {asset.icon}
                                </div>
                                <div>
                                    <h4 className="text-xl font-black uppercase italic text-gray-900 dark:text-white tracking-tight leading-tight">{asset.name}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{asset.type} • {asset.size}</p>
                                </div>
                            </div>
                            <button className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-600 transition-colors border-t border-gray-50 dark:border-gray-800 pt-4">
                                <Download className="w-3 h-3" />
                                Download File
                            </button>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 relative h-80 rounded-[3rem] overflow-hidden group">
                        <img
                            src="https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/Akha01.jpg"
                            alt="Showcase"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-12 flex flex-col justify-end">
                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Social Media Pack</h3>
                            <p className="text-white/70 text-sm max-w-sm mb-6 font-medium">Pre-sized Vertical Stories and Posts for Instagram and Facebook.</p>
                            <button className="w-fit flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white hover:text-brand-500 transition-colors">
                                Access Folder <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[3rem] p-10 border border-gray-200 dark:border-gray-700 flex flex-col justify-center items-center text-center space-y-4">
                        <Share2 className="w-10 h-10 text-brand-500" />
                        <h4 className="text-xl font-black uppercase italic text-gray-900 dark:text-white tracking-tight">Need More help?</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed italic">
                            "Looking for something specific or custom branding materials? Our marketing tea is ready to assist."
                        </p>
                        <button className="text-[10px] font-black uppercase tracking-widest text-brand-600 hover:scale-105 active:scale-95 transition-all mb-4">
                            Request Custom Assets
                        </button>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default AgencyAssets;
