/**
 * Interface for role definition
 */
export interface Role {
  id: string;
  name: string;
  category?: string;
}

/**
 * Available roles for users to select
 */
export const availableRoles: Role[] = [
  { id: 'frontend', name: 'Frontend Engineer', category: 'engineering' },
  { id: 'backend', name: 'Backend Engineer', category: 'engineering' },
  { id: 'fullstack', name: 'Full Stack Engineer', category: 'engineering' },
  { id: 'mobile', name: 'Mobile Developer', category: 'engineering' },
  { id: 'devops', name: 'DevOps / SRE', category: 'engineering' },
  { id: 'data', name: 'Data Scientist', category: 'data' },
  { id: 'pm', name: 'Product Manager', category: 'product' },
  { id: 'design', name: 'UX/UI Designer', category: 'design' },
  { id: 'eng_manager', name: 'Engineering Manager', category: 'management' },
]; 