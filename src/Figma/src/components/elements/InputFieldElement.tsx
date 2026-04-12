import { useState } from 'react';
import { SearchField } from '../designSystem';

export default function InputFieldElement() {
  const [firstInput, setFirstInput] = useState('');
  const [secondInput, setSecondInput] = useState('');

  return (
    <div className="w-[240px] rounded-md border border-dashed border-accent p-2">
      <div className="space-y-1">
        <SearchField value={firstInput} onChange={setFirstInput} placeholder="Placeholder" />
        <SearchField value={secondInput} onChange={setSecondInput} placeholder="Placeholder" />
      </div>
    </div>
  );
}
