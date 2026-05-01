type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <section className="mt-6 rounded-2xl border border-blue-600/50 bg-blue-800/80 p-5 shadow-lg backdrop-blur-sm animate-fade-in">
      {/* Header */}
      <div className="mb-5 space-y-1.5">
        <h2 className="text-[18px] font-semibold text-text-primary">
          {title}
        </h2>
        <p className="text-[14px] leading-relaxed text-text-secondary">
          {description}
        </p>
      </div>

      {/* Form Content */}
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}
