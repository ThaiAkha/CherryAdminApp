import React, { createContext, useContext, useState } from 'react';

interface PageHeaderContextType {
    title: string;
    subtitle: string;
    actions: React.ReactNode | null;
    setPageHeader: (title: string, subtitle?: string, actions?: React.ReactNode) => void;
}

const PageHeaderContext = createContext<PageHeaderContextType | undefined>(undefined);

export const PageHeaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [actions, setActions] = useState<React.ReactNode | null>(null);

    const setPageHeader = React.useCallback((t: string, s: string = '', a: React.ReactNode = null) => {
        setTitle(t);
        setSubtitle(s);
        setActions(a);
    }, []);

    const value = React.useMemo(() => ({ title, subtitle, actions, setPageHeader }), [title, subtitle, actions, setPageHeader]);

    return (
        <PageHeaderContext.Provider value={value}>
            {children}
        </PageHeaderContext.Provider>
    );
};

export const usePageHeader = () => {
    const context = useContext(PageHeaderContext);
    if (!context) {
        throw new Error('usePageHeader must be used within a PageHeaderProvider');
    }
    return context;
};
