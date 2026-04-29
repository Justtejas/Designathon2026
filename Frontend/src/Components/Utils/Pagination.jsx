import * as React from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

export default function PaginationRounded({ count, onChange }) {
  return (
    <Stack spacing={2} className="flex justify-center my-4">
      <Pagination 
        count={count} 
        variant="outlined" 
        shape="rounded" 
        onChange={onChange} 
        className="flex justify-center"
      />
    </Stack>
  );
}
