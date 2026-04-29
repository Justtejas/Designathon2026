import * as React from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';


export default function CustomPagination({ totalItems, itemsPerPage, onPageChange }) {
    const [currentPage, setCurrentPage] = React.useState(1);
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        onPageChange(value); 
    };

    return (
        <div className="p-7 flex justify-center items-center mt-4">
            <div className="flex space-x-2 items-center">
                <Stack spacing={2} className="flex justify-center">
                    <Pagination 
                        count={totalPages} 
                        page={currentPage} 
                        variant="outlined" 
                        shape="rounded" 
                        onChange={handlePageChange} 
                        className="flex justify-center "
                        sx={{ "& .MuiPaginationItem-root": { color: "#4B5563" } }}
                    />
                </Stack>
            </div>
        </div>
    );
}