import { Header, HeaderLogo, MainPanel } from '@tanstack/devtools-ui'
import { useStyles } from '../styles/use-styles'
import { TimeProvider } from '../store/time-context'

export default function Devtools() {
  return (
    <TimeProvider>
      <DevtoolsContent />
    </TimeProvider>
  )
}

function DevtoolsContent() {
  const styles = useStyles()
  return (
    <MainPanel>
      <Header>
        <HeaderLogo flavor={{ light: '#ec4899', dark: '#ec4899' }}>
          TanStack Time
        </HeaderLogo>
      </Header>

      <div class={styles().mainContainer}></div>
    </MainPanel>
  )
}
