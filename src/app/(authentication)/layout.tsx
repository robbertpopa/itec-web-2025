export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <div className="size-full flex justify-center items-center box-border p-4">
        {children}
      </div>
  )
}
