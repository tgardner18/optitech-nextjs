export type TabsStyleOptions = {
  tabStyle:         'underline' | 'pill' | 'buttonGroup'
  tabPosition:      'top' | 'side'
  color:            'canvas' | 'surface' | 'brand' | 'glass'
  contentLayout:    'textOnly' | 'imageRight' | 'imageLeft'
  triggerAlign:     'left' | 'center'
  autoPlay:         boolean
  autoPlayDuration: 3 | 5 | 7
}

export function getTabsStyles(s: Record<string, string | boolean>): TabsStyleOptions {
  return {
    tabStyle:         (s.tabStyle      ?? 'underline') as TabsStyleOptions['tabStyle'],
    tabPosition:      (s.tabPosition   ?? 'top')       as TabsStyleOptions['tabPosition'],
    color:            (s.color         ?? 'canvas')    as TabsStyleOptions['color'],
    contentLayout:    (s.contentLayout ?? 'textOnly')  as TabsStyleOptions['contentLayout'],
    triggerAlign:     (s.triggerAlign  ?? 'left')      as TabsStyleOptions['triggerAlign'],
    autoPlay:         s.autoPlay === 'on' || s.autoPlay === true,
    autoPlayDuration: ({ s3: 3, s5: 5, s7: 7 }[s.autoPlayDuration as string] ?? 5) as 3 | 5 | 7,
  }
}
