import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextField, TextAreaField, SelectField } from '../form-fields';

describe('TextField', () => {
  it('renders label and input', () => {
    render(<TextField label="邮箱" />);

    expect(screen.getByText('邮箱')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows required asterisk', () => {
    render(<TextField label="名称" required />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows helper text', () => {
    render(<TextField label="标签" helper="使用逗号分隔" />);

    expect(screen.getByText('使用逗号分隔')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<TextField label="邮箱" error="邮箱格式不正确" />);

    expect(screen.getByText('邮箱格式不正确')).toBeInTheDocument();
  });

  it('prioritizes error over helper', () => {
    render(<TextField label="邮箱" helper="请输入" error="格式错误" />);

    expect(screen.getByText('格式错误')).toBeInTheDocument();
    expect(screen.queryByText('请输入')).not.toBeInTheDocument();
  });
});

describe('TextAreaField', () => {
  it('renders label and textarea', () => {
    render(<TextAreaField label="描述" />);

    expect(screen.getByText('描述')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<TextAreaField label="描述" error="必填" />);

    expect(screen.getByText('必填')).toBeInTheDocument();
  });
});

describe('SelectField', () => {
  it('renders label and select', () => {
    render(
      <SelectField label="分类">
        <option value="a">A</option>
        <option value="b">B</option>
      </SelectField>
    );

    expect(screen.getByText('分类')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows helper text', () => {
    render(
      <SelectField label="类型" helper="选择一个">
        <option value="x">X</option>
      </SelectField>
    );

    expect(screen.getByText('选择一个')).toBeInTheDocument();
  });
});
