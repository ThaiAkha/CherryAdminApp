import React from 'react';
import PageMeta from '../../components/common/PageMeta';
import {
    DataExplorerLayout,
    DataExplorerToolbar,
} from '../../components/data-explorer';
import ClassPicker from '../../components/common/ClassPicker';

// Modular Components
import PosSidebar from '../../components/manager/pos/PosSidebar';
import PosContent from '../../components/manager/pos/PosContent';
import PosInspector from '../../components/manager/pos/PosInspector';

// Logic Hook
import { useManagerPos } from '../../hooks/useManagerPos';

const ManagerPos: React.FC = () => {
    const {
        filteredGuests,
        displayedProducts,
        mainCategories,
        subCategoryTabs,
        activeGuest,
        currentTab,
        totalDue,
        loading,
        isProcessing,
        selectedDate,
        selectedSession,
        activeCategory,
        activeSubCategory,
        activeGuestId,
        setSelectedDate,
        setSelectedSession,
        setActiveGuestId,
        setActiveCategory,
        setActiveSubCategory,
        initData,
        addToTab,
        handleRemoveItem,
        handleSaveConfirmed,
        handlePayCash,
        closeInspector,
    } = useManagerPos();

    return (
        <>
            <PageMeta
                title="Store Front | Thai Akha Kitchen"
                description="Manage on-site sales, merchandise, and guest tabs during classes."
            />

            <DataExplorerLayout
                viewMode="table"
                inspectorOpen={!!activeGuestId}
                onInspectorClose={closeInspector}
                sidebar={
                    <PosSidebar
                        filteredGuests={filteredGuests}
                        activeGuestId={activeGuestId}
                        onSelectGuest={setActiveGuestId}
                    />
                }
                toolbar={
                    <DataExplorerToolbar
                        viewMode="table"
                        onViewModeChange={() => { }}
                        searchValue=""
                        onSearchChange={() => { }}
                        onRefresh={initData}
                        isRefreshing={loading}
                        primaryAction={
                            <ClassPicker
                                date={selectedDate}
                                onDateChange={setSelectedDate}
                                session={selectedSession}
                                onSessionChange={setSelectedSession}
                            />
                        }
                    />
                }
                inspector={
                    <PosInspector
                        activeGuest={activeGuest}
                        activeGuestId={activeGuestId}
                        currentTab={currentTab}
                        totalDue={totalDue}
                        isProcessing={isProcessing}
                        onRemoveItem={handleRemoveItem}
                        onSave={handleSaveConfirmed}
                        onPayCash={handlePayCash}
                        onClose={closeInspector}
                    />
                }
            >
                <PosContent
                    loading={loading}
                    displayedProducts={displayedProducts}
                    mainCategories={mainCategories}
                    subCategoryTabs={subCategoryTabs}
                    activeCategory={activeCategory}
                    activeSubCategory={activeSubCategory}
                    onCategoryChange={setActiveCategory}
                    onSubCategoryChange={setActiveSubCategory}
                    onAddToTab={addToTab}
                />
            </DataExplorerLayout>
        </>
    );
};

export default ManagerPos;
