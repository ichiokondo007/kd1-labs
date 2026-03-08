export interface Step {
  label: string;
  cmd: string;
}

export interface MenuEntry {
  name: string;
  value: string;
  description?: string;
}
