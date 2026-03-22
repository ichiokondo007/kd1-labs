import { Heading } from '@/components/heading'
import { Text } from '@/components/text'
import { Button } from '@/components/button'

const GRAFANA_URL = 'http://localhost:3001'

export default function YjsMetricsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Heading>Yjs-server Metrics</Heading>
      <Text className="mt-2">
        Yjs collaboration server のメトリクスダッシュボード（Grafana）を確認できます。
      </Text>
      <div className="mt-6">
        <Button
          onClick={() => window.open(GRAFANA_URL, '_blank', 'noopener,noreferrer')}
        >
          <img src="/icons8-grafana-48.png" alt="" className="size-5" data-slot="icon" />
          Open Grafana
        </Button>
      </div>
      <div className="mt-8">
        <img
          src="/md/grafana-overview.png"
          alt="Grafana dashboard overview"
          className="w-full rounded-lg ring-1 ring-zinc-950/5 dark:ring-white/10"
        />
      </div>
    </div>
  )
}
