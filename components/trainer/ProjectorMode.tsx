"use client"

import { useEffect } from "react"

type ProjectorModeProps = {
  enabled: boolean
}

export function ProjectorMode({ enabled }: ProjectorModeProps) {
  useEffect(() => {
    if (enabled) {
      document.body.setAttribute('data-projector', 'true')
    } else {
      document.body.removeAttribute('data-projector')
    }

    return () => {
      document.body.removeAttribute('data-projector')
    }
  }, [enabled])

  return null // This component doesn't render, just sets body attribute
}

/*
TODO: Add CSS in globals.css:

[data-projector="true"] {
  background: #1a1a1a;
  color: white;
}

[data-projector="true"] nav,
[data-projector="true"] .hide-in-projector {
  display: none;
}

[data-projector="true"] .enlarge-in-projector {
  font-size: 1.5em;
}
*/

// TODO: Add countdown overlay toggle feature
