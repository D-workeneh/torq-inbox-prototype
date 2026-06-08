'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Cloud,
  Copy,
  Eye,
  Hash,
  Keyboard,
  Layers,
  Maximize2,
  MousePointer2,
  Play,
  Plus,
  Redo2,
  Search,
  Trash2,
  Undo2,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Phase1WorkflowDesignerSidePanel,
  WORKFLOW_SIDE_PANEL_W,
} from './Phase1WorkflowDesignerSidePanel';
import {
  DEFAULT_SELECTED_STEP_ID,
  DEFAULT_WORKFLOW_CANVAS_STEPS,
  WORKFLOW_DESIGNER_CATEGORIES,
  WORKFLOW_OPERATOR_TILES,
  type WorkflowCanvasStep,
  type WorkflowDesignerCategory,
} from './workflowDesignerData';
import {
  WorkflowCategoryIcon,
  WorkflowOperatorIcon,
} from './workflowDesignerIcons';
import { p1Font, p1Text } from './phase1Typography';

const DOT_BG = {
  backgroundColor: '#F5F5F5',
  backgroundImage: 'radial-gradient(circle, #C4C4C4 1px, transparent 1px)',
  backgroundSize: '16px 16px',
};

const PALETTE_FLOAT_INSET = 16;
const PALETTE_WIDTH = 340;
const PALETTE_COLLAPSED_BTN = 36;
const PALETTE_SHADOW =
  '0 4px 24px rgba(9, 10, 11, 0.08), 0 1px 3px rgba(9, 10, 11, 0.06)';

function StepFloatingToolbar() {
  const btn: React.CSSProperties = {
    width: 32,
    height: 32,
    border: 'none',
    background: 'transparent',
    borderRadius: 6,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: p1Text.secondary,
  };
  return (
    <div
      style={{
        position: 'absolute',
        top: -44,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 2,
        padding: '4px 6px',
        background: '#fff',
        borderRadius: 8,
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        zIndex: 5,
      }}
    >
      <button type="button" aria-label="Run step" style={btn}>
        <Play size={15} />
      </button>
      <button type="button" aria-label="Duplicate" style={btn}>
        <Copy size={15} />
      </button>
      <button type="button" aria-label="View" style={btn}>
        <Eye size={15} />
      </button>
      <button type="button" aria-label="Delete" style={btn}>
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function CanvasStepBlock({
  step,
  selected,
  onSelect,
}: {
  step: WorkflowCanvasStep;
  selected: boolean;
  onSelect: () => void;
}) {
  const isTrigger = step.kind === 'trigger';
  const isHttp = step.category === 'HTTP';

  return (
    <div style={{ position: 'relative', width: 300, paddingTop: selected ? 8 : 0 }}>
      {selected && <StepFloatingToolbar />}
      {step.failed && (
        <span
          style={{
            position: 'absolute',
            top: selected ? 2 : -6,
            right: -6,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#DC2626',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            lineHeight: 1,
            zIndex: 3,
            border: '2px solid #fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}
          title="Step failed"
        >
          ×
        </span>
      )}
      {step.warn && !step.failed && (
        <div
          style={{
            position: 'absolute',
            left: -28,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#F97316',
          }}
          title="Configuration warning"
        >
          <AlertTriangle size={16} fill="#F97316" stroke="#fff" strokeWidth={1} />
        </div>
      )}
      <button
        type="button"
        onClick={onSelect}
        style={{
          display: 'block',
          width: '100%',
          padding: 0,
          borderRadius: 10,
          border: selected
            ? '2px solid #090A0B'
            : '1px solid var(--border-level-2, #E5E7EB)',
          background: '#fff',
          overflow: 'hidden',
          boxShadow: selected
            ? '0 0 0 3px rgba(9, 10, 11, 0.12)'
            : '0 1px 2px rgba(0,0,0,0.04)',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {isTrigger ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              background: '#fff',
              boxShadow: 'inset 4px 0 0 #090A0B',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: '#090A0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Zap size={15} color="#fff" strokeWidth={2} fill="none" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: p1Font.body3,
                  color: p1Text.tertiary,
                  fontFamily: p1Font.family,
                  lineHeight: 1.2,
                }}
              >
                {step.category}
              </div>
              <div
                style={{
                  fontSize: p1Font.body2,
                  color: p1Text.primary,
                  fontFamily: p1Font.family,
                  fontWeight: 600,
                  lineHeight: 1.3,
                }}
              >
                {step.title}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: isHttp ? '#E8EDF3' : step.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: isHttp ? '#6B7280' : '#fff',
              }}
            >
              <span style={{ fontSize: isHttp ? 14 : 10, fontWeight: 700 }}>{step.iconLabel}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: p1Font.body3,
                  color: p1Text.tertiary,
                  fontFamily: p1Font.family,
                  lineHeight: 1.2,
                }}
              >
                {step.category}:
              </div>
              <div
                style={{
                  fontSize: p1Font.body2,
                  color: p1Text.primary,
                  fontFamily: p1Font.family,
                  fontWeight: 500,
                  lineHeight: 1.3,
                }}
              >
                {step.title}
              </div>
            </div>
          </div>
        )}
      </button>
    </div>
  );
}

function ConnectorAdd() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 40 }}>
      <div style={{ width: 1, flex: 1, background: '#D1D5DB' }} />
      <button
        type="button"
        aria-label="Add step"
        style={{
          width: 22,
          height: 22,
          borderRadius: 4,
          border: '1px solid #D1D5DB',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          color: p1Text.secondary,
        }}
      >
        <Plus size={12} />
      </button>
      <div style={{ width: 1, flex: 1, background: '#D1D5DB' }} />
    </div>
  );
}

export function Phase1WorkflowDesignerView({
  workflowName,
  workspaceName = 'torq-dev',
}: {
  workflowName: string;
  workspaceName?: string;
}) {
  const [designerTab, setDesignerTab] = useState<'designer' | 'run-log'>('designer');
  const [activeCategory, setActiveCategory] =
    useState<WorkflowDesignerCategory>('operators');
  const [paletteCollapsed, setPaletteCollapsed] = useState(true);
  const [selectedStepId, setSelectedStepId] = useState(DEFAULT_SELECTED_STEP_ID);

  const steps = DEFAULT_WORKFLOW_CANVAS_STEPS;
  const selectedStep = steps.find((s) => s.id === selectedStepId) ?? null;

  const canvasPadLeft = paletteCollapsed
    ? PALETTE_FLOAT_INSET + PALETTE_COLLAPSED_BTN + 12
    : PALETTE_FLOAT_INSET + PALETTE_WIDTH + PALETTE_FLOAT_INSET;
  const canvasPadRight = selectedStep
    ? WORKFLOW_SIDE_PANEL_W + PALETTE_FLOAT_INSET * 2
    : PALETTE_FLOAT_INSET;

  return (
    <main
      className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--surface)]"
      style={{ fontFamily: p1Font.family }}
    >
      {/* Top bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 48,
          padding: '0 16px',
          borderBottom: '1px solid var(--border-level-1, #F0F0F0)',
          flexShrink: 0,
          gap: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: p1Font.body2,
            color: p1Text.secondary,
            minWidth: 0,
            flexShrink: 1,
          }}
        >
          <span style={{ color: p1Text.tertiary }}>{workspaceName}</span>
          <ChevronRight size={14} style={{ flexShrink: 0, color: p1Text.tertiary }} />
          <span
            style={{
              color: p1Text.primary,
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {workflowName}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: 6,
            border: '1px solid var(--border-level-2, #E5E7EB)',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {(['designer', 'run-log'] as const).map((tab) => {
            const active = designerTab === tab;
            const label = tab === 'designer' ? 'Designer' : 'Run Log';
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setDesignerTab(tab)}
                style={{
                  padding: '6px 14px',
                  fontSize: p1Font.body2,
                  fontFamily: p1Font.family,
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  background: active ? '#090A0B' : '#fff',
                  color: active ? '#fff' : p1Text.secondary,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button
            type="button"
            title="Warnings"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#F97316',
              fontSize: p1Font.body2,
              fontWeight: 500,
            }}
          >
            <AlertTriangle size={16} />
            21
          </button>
          <button
            type="button"
            aria-label="Sync status"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: p1Text.tertiary,
              padding: 4,
            }}
          >
            <Cloud size={18} />
          </button>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#2864FF',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            D
          </div>
          <Button variant="third" size="small" leftIcon={<Play size={14} />}>
            Test Run
          </Button>
          <div className="inline-flex items-center">
            <Button variant="dark" size="small" className="!rounded-r-none">
              Publish
            </Button>
            <Button
              variant="dark"
              size="small"
              aria-label="Publish options"
              className="!rounded-l-none !border-l !border-white/20 !px-2"
            >
              <ChevronDown className="h-3 w-3" strokeWidth={2} aria-hidden />
            </Button>
          </div>
        </div>
      </header>

      {designerTab === 'designer' ? (
        <div
          style={{
            flex: 1,
            position: 'relative',
            minHeight: 0,
            minWidth: 0,
            overflow: 'hidden',
            ...DOT_BG,
          }}
        >
          {/* Floating step palette */}
          {!paletteCollapsed && (
            <aside
              style={{
                position: 'absolute',
                top: PALETTE_FLOAT_INSET,
                left: PALETTE_FLOAT_INSET,
                bottom: PALETTE_FLOAT_INSET,
                width: PALETTE_WIDTH,
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
                background: '#fff',
                borderRadius: 12,
                border: '1px solid var(--border-level-1, #EBEBEB)',
                boxShadow: PALETTE_SHADOW,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderBottom: '1px solid var(--border-level-1, #F0F0F0)',
                }}
              >
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search
                    size={14}
                    style={{
                      position: 'absolute',
                      left: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: p1Text.tertiary,
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    type="search"
                    placeholder="Search for a step"
                    style={{
                      width: '100%',
                      height: 32,
                      paddingLeft: 32,
                      paddingRight: 10,
                      fontSize: p1Font.body2,
                      fontFamily: p1Font.family,
                      border: '1px solid var(--border-level-2, #E5E7EB)',
                      borderRadius: 6,
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
                <button
                  type="button"
                  aria-label="Collapse step panel"
                  onClick={() => setPaletteCollapsed(true)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: p1Text.tertiary,
                    fontSize: 12,
                    padding: 4,
                  }}
                >
                  {'<<'}
                </button>
              </div>

              <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                <nav
                  style={{
                    width: 88,
                    flexShrink: 0,
                    borderRight: '1px solid var(--border-level-1, #F0F0F0)',
                    padding: '6px 4px',
                    overflowY: 'auto',
                  }}
                >
                  {WORKFLOW_DESIGNER_CATEGORIES.map((cat) => {
                    const active = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                          width: '100%',
                          padding: '10px 4px',
                          marginBottom: 2,
                          border: 'none',
                          borderRadius: 6,
                          background: active ? '#F3F4F6' : 'transparent',
                          fontSize: 11,
                          fontFamily: p1Font.family,
                          fontWeight: active ? 600 : 400,
                          color: '#090A0B',
                          cursor: 'pointer',
                          lineHeight: 1.2,
                          textAlign: 'center',
                        }}
                      >
                        <WorkflowCategoryIcon id={cat.id} />
                        {cat.label}
                      </button>
                    );
                  })}
                </nav>

                <div
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    overflowY: 'auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 72px)',
                    gap: '14px 10px',
                    alignContent: 'start',
                    justifyContent: 'start',
                  }}
                >
                  {WORKFLOW_OPERATOR_TILES.map((tile) => (
                    <button
                      key={tile.id}
                      type="button"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        width: 72,
                      }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 10,
                          background: tile.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <WorkflowOperatorIcon id={tile.id} />
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: p1Font.family,
                          color: '#090A0B',
                          textAlign: 'center',
                          lineHeight: 1.25,
                          fontWeight: 400,
                        }}
                      >
                        {tile.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {paletteCollapsed && (
            <button
              type="button"
              aria-label="Expand step panel"
              onClick={() => setPaletteCollapsed(false)}
              style={{
                position: 'absolute',
                top: PALETTE_FLOAT_INSET,
                left: PALETTE_FLOAT_INSET,
                zIndex: 20,
                width: 36,
                height: 36,
                borderRadius: 10,
                border: '1px solid var(--border-level-1, #EBEBEB)',
                background: '#fff',
                boxShadow: PALETTE_SHADOW,
                cursor: 'pointer',
                fontSize: 11,
                color: p1Text.tertiary,
              }}
            >
              {'>>'}
            </button>
          )}

          {selectedStep && <Phase1WorkflowDesignerSidePanel step={selectedStep} />}

          {/* Canvas */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'auto',
              display: 'flex',
              justifyContent: 'center',
              paddingTop: PALETTE_FLOAT_INSET,
              paddingBottom: 120,
              paddingLeft: canvasPadLeft,
              paddingRight: canvasPadRight,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {steps.map((step, i) => (
                <div
                  key={step.id}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  {i > 0 && <ConnectorAdd />}
                  <CanvasStepBlock
                    step={step}
                    selected={selectedStepId === step.id}
                    onSelect={() => setSelectedStepId(step.id)}
                  />
                </div>
              ))}
              <ConnectorAdd />
            </div>
          </div>

          {/* Bottom canvas toolbar (screen-centered) + Test Pad 4px to its right */}
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 12,
            }}
          >
            <div style={{ position: 'relative', pointerEvents: 'auto' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  padding: '4px 8px',
                  background: '#fff',
                  borderRadius: 8,
                  border: '1px solid var(--border-level-2, #E5E7EB)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                {[
                  { icon: ZoomOut, label: 'Zoom out' },
                  { icon: ZoomIn, label: 'Zoom in' },
                  { icon: MousePointer2, label: 'Select' },
                  { icon: Undo2, label: 'Undo' },
                  { icon: Redo2, label: 'Redo' },
                  { icon: Maximize2, label: 'Fit to screen' },
                  { icon: Layers, label: 'Layers' },
                  { icon: Keyboard, label: 'Shortcuts' },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    aria-label={label}
                    style={{
                      width: 32,
                      height: 32,
                      border: 'none',
                      background: 'transparent',
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: p1Text.secondary,
                    }}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>

              <button
                type="button"
                aria-label="Test Pad"
                style={{
                  position: 'absolute',
                  left: 'calc(100% + 4px)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  height: 40,
                  borderRadius: 8,
                  border: '1px solid var(--border-level-2, #E5E7EB)',
                  background: '#fff',
                  fontSize: p1Font.body2,
                  fontFamily: p1Font.family,
                  fontWeight: 500,
                  color: p1Text.primary,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  whiteSpace: 'nowrap',
                }}
              >
                <Hash size={16} strokeWidth={2} color="#090A0B" aria-hidden />
                Test Pad
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 0.2,
                    textTransform: 'uppercase',
                    color: '#1D4ED8',
                    background: '#DBEAFE',
                    padding: '2px 6px',
                    borderRadius: 4,
                    lineHeight: 1.2,
                  }}
                >
                  NEW!
                </span>
              </button>
            </div>
          </div>

        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: p1Text.tertiary,
            fontSize: p1Font.body1,
          }}
        >
          Run log view (prototype placeholder)
        </div>
      )}
    </main>
  );
}
