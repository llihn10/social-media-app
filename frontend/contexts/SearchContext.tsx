import React, { createContext, useContext, useState, useCallback } from 'react';

interface SearchContextType {
    isSearchVisible: boolean;
    openSearch: () => void;
    closeSearch: () => void;
}

const SearchContext = createContext<SearchContextType>({
    isSearchVisible: false,
    openSearch: () => {},
    closeSearch: () => {},
});

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const openSearch = useCallback(() => setIsSearchVisible(true), []);
    const closeSearch = useCallback(() => setIsSearchVisible(false), []);

    return (
        <SearchContext.Provider value={{ isSearchVisible, openSearch, closeSearch }}>
            {children}
        </SearchContext.Provider>
    );
};
