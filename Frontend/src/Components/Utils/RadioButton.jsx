// // import * as React from 'react';
// // import Checkbox from '@mui/material/Checkbox';

// // const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

// // export default function Checkboxes() {
// //   return (
// //     <div>
// //       <Checkbox {...label} />
// //     </div>
// //   );
// // }
import Radio from '@mui/material/Radio';

export default function RadioButton({ selectedValue, onChange, value, label }) {
  const isChecked = selectedValue === value;

  const handleChange = () => {
    // console.log(`RadioButton clicked. Current state: ${isChecked}, value: ${value}`);
    const newValue = isChecked ? null : value;
    // console.log(`Calling onChange with new value: ${newValue}`);
    onChange(newValue);
  };

  // console.log(`Rendering RadioButton: value=${value}, isChecked=${isChecked}`);

  return (
    <div>
      <Radio
        checked={isChecked}
        onChange={handleChange}
        value={value}
        name="radio-buttons"
        inputProps={{ 'aria-label': label }}
      />
      {label}
    </div>
  );
}
