import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const roles = [
  'Software Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'Data Scientist',
  'ML Engineer',
  'DevOps / SRE',
  'System Design',
  'Other',
];

interface RoleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const RoleSelector = ({ value, onChange }: RoleSelectorProps) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="bg-card">
      <SelectValue placeholder="Select target role" />
    </SelectTrigger>
    <SelectContent>
      {roles.map((r) => (
        <SelectItem key={r} value={r}>
          {r}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default RoleSelector;
