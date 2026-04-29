import { useState } from 'react';

const usePagination = (itemsPerPage, items) => {
    const [currentPage, setCurrentPage] = useState(1);

    const pageCount = Math.ceil(items.length / itemsPerPage);
    
    const currentItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return { currentItems, paginate, pageCount, currentPage, setCurrentPage };
};

export default usePagination;
