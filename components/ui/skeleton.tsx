import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...props}
    />
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <Skeleton className="h-4 w-40 mb-4" />
          <div className="flex items-end gap-3 h-40">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <Skeleton className="w-full max-w-10 h-full" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-6" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <Skeleton className="h-4 w-40 mb-4" />
          <div className="flex flex-col gap-3">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-2.5 h-2.5 rounded-full" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="w-24 h-1.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AgenciesSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-24 mt-1" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-32" />
                <div className="flex items-center gap-2 mt-1">
                  <Skeleton className="h-3 w-6" />
                  <Skeleton className="h-3 w-6" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 text-xs">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmployeesSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-24 mt-1" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array(2).fill(0).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <Skeleton className="h-4 w-32 mb-3" />
            <div className="flex flex-col gap-1.5">
              {Array(3).fill(0).map((_, j) => (
                <div key={j} className="flex items-center justify-between text-sm">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-8" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs">
                {Array(5).fill(0).map((_, i) => (
                  <th key={i} className="p-4"><Skeleton className="h-3 w-16" /></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array(5).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-border/30">
                  <td className="p-4"><Skeleton className="h-8 w-32" /></td>
                  <td className="p-4"><Skeleton className="h-3 w-20" /></td>
                  <td className="p-4"><Skeleton className="h-3 w-16" /></td>
                  <td className="p-4"><Skeleton className="h-3 w-16" /></td>
                  <td className="p-4"><Skeleton className="h-3 w-12" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function RolesSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-24 mt-1" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16 mt-1" />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Array(4).fill(0).map((_, j) => (
                <Skeleton key={j} className="h-4 w-12" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatisticsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl p-6">
        <Skeleton className="h-4 w-40 mb-4" />
        <div className="flex items-end gap-3 h-40">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <Skeleton className="w-full max-w-10 h-full" />
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-6" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <Skeleton className="h-4 w-40 mb-4" />
          <div className="flex flex-col gap-3">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-2.5 h-2.5 rounded-full" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="w-24 h-1.5" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <Skeleton className="h-4 w-40 mb-4" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  )
}

function ThirdPartiesSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="flex bg-muted p-1 rounded-xl w-fit">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24 mt-1" />
              </div>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-1.5">
              {Array(3).fill(0).map((_, j) => (
                <Skeleton key={j} className="h-4 w-12" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProductsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64 mt-1" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20 mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export { Skeleton, DashboardSkeleton, AgenciesSkeleton, EmployeesSkeleton, RolesSkeleton, StatisticsSkeleton, ThirdPartiesSkeleton, ProductsSkeleton }
