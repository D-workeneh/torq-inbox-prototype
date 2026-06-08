'use client';

import { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  Maximize2,
  MoreHorizontal,
  Play,
  Trash2,
} from 'lucide-react';
import type { WorkflowCanvasStep } from './workflowDesignerData';
import { p1Font, p1Text } from './phase1Typography';

const PANEL_W = 456;
const PANEL_PAD = 16;
/** Phase switcher FAB (bottom 24 + 44px) + 16px gap above corner */
export const WORKFLOW_PANEL_BOTTOM_INSET = 24 + 44 + 16;
const LINE = '#090A0B';
const DIVIDER = '#EBEBEB';
const JSON_BG = '#F4F4F5';
const JSON_BORDER = '#E8E8E8';

const RUN_HISTORY = [
  {
    id: 'AT-611974',
    failed: true,
    time: 'Today at 5:42 PM',
    duration: '42s',
    by: 'David Workeneh',
    error: 'Failed to send request after retries',
  },
  {
    id: 'AT-611969',
    failed: false,
    time: 'Today at 5:41 PM',
    duration: '261ms',
    by: 'David Workeneh',
  },
  {
    id: 'AT-611948',
    failed: false,
    time: 'Today at 5:36 PM',
    duration: '33s',
    by: 'David Workeneh',
  },
  {
    id: 'AT-611947',
    failed: false,
    time: 'Today at 5:35 PM',
    duration: '39s',
    by: 'David Workeneh',
  },
] as const;

function HeaderTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: 'none',
        background: 'transparent',
        padding: '0 0 10px',
        marginRight: 14,
        fontSize: 13,
        fontFamily: p1Font.family,
        fontWeight: active ? 600 : 400,
        color: active ? LINE : p1Text.secondary,
        cursor: 'pointer',
        borderBottom: active ? `2px solid ${LINE}` : '2px solid transparent',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}

function SubTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: 'none',
        background: 'transparent',
        padding: '6px 0',
        marginRight: 14,
        fontSize: 13,
        fontFamily: p1Font.family,
        fontWeight: active ? 600 : 400,
        color: active ? LINE : p1Text.secondary,
        cursor: 'pointer',
        borderBottom: active ? `2px solid ${LINE}` : '2px solid transparent',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

function JsonOutputBlock() {
  const lineNums = [1, 2, 3, 4, 5, 6, 7];
  const keyColor = '#9F1239';
  const strColor = '#2563EB';
  const numColor = '#1E3A8A';

  return (
    <div
      style={{
        display: 'flex',
        borderRadius: 8,
        border: `1px solid ${JSON_BORDER}`,
        background: JSON_BG,
        overflow: 'hidden',
        marginTop: 10,
        marginBottom: 4,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          padding: '10px 0 10px 10px',
          fontSize: 11,
          lineHeight: 1.55,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          color: '#94A3B8',
          textAlign: 'right',
          userSelect: 'none',
        }}
      >
        {lineNums.map((n) => (
          <div key={n}>{n}</div>
        ))}
      </div>
      <pre
        style={{
          margin: 0,
          padding: '10px 12px 10px 8px',
          fontSize: 11,
          lineHeight: 1.55,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          overflow: 'auto',
          flex: 1,
        }}
      >
        <span style={{ color: LINE }}>{'{'}</span>
        {'\n  '}
        <span style={{ color: keyColor }}>&quot;step_status&quot;</span>
        <span style={{ color: LINE }}>: {'{'}</span>
        {'\n    '}
        <span style={{ color: keyColor }}>&quot;code&quot;</span>
        <span style={{ color: LINE }}>: </span>
        <span style={{ color: numColor }}>9</span>
        <span style={{ color: LINE }}>,</span>
        {'\n    '}
        <span style={{ color: keyColor }}>&quot;message&quot;</span>
        <span style={{ color: LINE }}>: </span>
        <span style={{ color: strColor }}>
          &quot;Failed to send request after retries&quot;
        </span>
        <span style={{ color: LINE }}>,</span>
        {'\n    '}
        <span style={{ color: keyColor }}>&quot;verbose&quot;</span>
        <span style={{ color: LINE }}>: </span>
        <span style={{ color: strColor }}>
          &quot;retrying due to dns lookup error&quot;
        </span>
        {'\n  '}
        <span style={{ color: LINE }}>{'}'}</span>
        {'\n'}
        <span style={{ color: LINE }}>{'}'}</span>
      </pre>
    </div>
  );
}

function ExecutionLogPanel() {
  const [expandedId, setExpandedId] = useState<string>(RUN_HISTORY[0].id);
  const [runTab, setRunTab] = useState<'output' | 'input' | 'debug'>('output');

  /** Icon | ID (natural width) | Time | Executed by | chevron */
  const execLogGridColumns = '24px auto minmax(108px, 1fr) minmax(96px, 1fr) 24px';
  const execLogGridGap = '0 20px';

  const iconBtnSm: React.CSSProperties = {
    border: 'none',
    background: 'transparent',
    padding: 4,
    cursor: 'pointer',
    color: p1Text.secondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: execLogGridColumns,
          gap: execLogGridGap,
          alignItems: 'center',
          padding: PANEL_PAD,
          fontSize: 11,
          fontWeight: 500,
          color: p1Text.tertiary,
        }}
      >
        <span />
        <span>ID</span>
        <span>Time</span>
        <span style={{ textAlign: 'right' }}>Executed by</span>
        <span />
      </div>

      <div>
        {RUN_HISTORY.map((run) => {
          const expanded = expandedId === run.id;

          return (
            <div
              key={run.id}
              style={{
                background: '#fff',
                paddingBottom: expanded ? 12 : 0,
              }}
            >
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? '' : run.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: execLogGridColumns,
                  gap: execLogGridGap,
                  alignItems: 'start',
                  width: '100%',
                  padding:
                    expanded && run.failed
                      ? `${PANEL_PAD}px ${PANEL_PAD}px 0`
                      : PANEL_PAD,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: p1Font.family,
                }}
              >
                <span style={{ paddingTop: 2, display: 'flex', justifyContent: 'center' }}>
                  {run.failed ? (
                    <span
                      style={{
                        display: 'flex',
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: '#DC2626',
                        color: '#fff',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      ×
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'flex',
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: '#16A34A',
                        color: '#fff',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </span>

                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: p1Text.primary,
                  }}
                >
                  {run.id}
                </span>

                <span style={{ fontSize: 12, color: p1Text.primary, lineHeight: 1.35 }}>
                  <span style={{ display: 'block' }}>{run.time}</span>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 11,
                      color: p1Text.tertiary,
                      marginTop: 2,
                    }}
                  >
                    Duration: {run.duration}
                  </span>
                </span>

                <span
                  style={{
                    fontSize: 12,
                    color: p1Text.primary,
                    textAlign: 'right',
                    paddingTop: 1,
                  }}
                >
                  {run.by}
                </span>

                <span
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    paddingTop: 2,
                    color: p1Text.tertiary,
                  }}
                >
                  {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>

              {expanded && run.failed && (
                <div style={{ padding: `0 ${PANEL_PAD}px ${PANEL_PAD}px` }}>
                  {run.error && (
                    <p
                      style={{
                        margin: '14px 0 12px',
                        fontSize: 13,
                        color: '#DC2626',
                        fontWeight: 400,
                        lineHeight: 1.4,
                      }}
                    >
                      {run.error}
                    </p>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      borderBottom: `1px solid ${DIVIDER}`,
                    }}
                  >
                    <div style={{ display: 'flex', minWidth: 0 }}>
                      <SubTab
                        label="Output"
                        active={runTab === 'output'}
                        onClick={() => setRunTab('output')}
                      />
                      <SubTab
                        label="Input"
                        active={runTab === 'input'}
                        onClick={() => setRunTab('input')}
                      />
                      <SubTab
                        label="Debug"
                        active={runTab === 'debug'}
                        onClick={() => setRunTab('debug')}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      <button type="button" aria-label="Copy output" style={iconBtnSm}>
                        <Copy size={15} strokeWidth={1.5} />
                      </button>
                      <button type="button" aria-label="Expand output" style={iconBtnSm}>
                        <Maximize2 size={15} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  {runTab === 'output' && <JsonOutputBlock />}
                  {runTab === 'input' && (
                    <p
                      style={{
                        padding: '12px 0 0',
                        margin: 0,
                        fontSize: 13,
                        color: p1Text.tertiary,
                      }}
                    >
                      Input payload for {run.id}
                    </p>
                  )}
                  {runTab === 'debug' && (
                    <p
                      style={{
                        padding: '12px 0 0',
                        margin: 0,
                        fontSize: 13,
                        color: p1Text.tertiary,
                      }}
                    >
                      Debug trace for {run.id}
                    </p>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}

function PropertiesPlaceholder({ step }: { step: WorkflowCanvasStep }) {
  return (
    <div style={{ padding: PANEL_PAD, fontSize: p1Font.body2, color: p1Text.secondary }}>
      Properties for {step.category}: {step.title}
    </div>
  );
}

export function Phase1WorkflowDesignerSidePanel({ step }: { step: WorkflowCanvasStep }) {
  const [panelTab, setPanelTab] = useState<'properties' | 'execution-log' | 'mock-output'>(
    step.failed ? 'execution-log' : 'properties',
  );

  const iconBtn: React.CSSProperties = {
    border: 'none',
    background: 'transparent',
    padding: 4,
    cursor: 'pointer',
    color: LINE,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const panelMaxHeight = `calc(100% - ${PANEL_PAD + WORKFLOW_PANEL_BOTTOM_INSET}px)`;

  return (
    <aside
      style={{
        position: 'absolute',
        top: PANEL_PAD,
        right: PANEL_PAD,
        width: PANEL_W,
        maxHeight: panelMaxHeight,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #EBEBEB',
        boxShadow: '0 4px 24px rgba(9, 10, 11, 0.08), 0 1px 3px rgba(9, 10, 11, 0.06)',
        overflow: 'hidden',
        fontFamily: p1Font.family,
      }}
    >
      <header style={{ flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 4,
            flexWrap: 'nowrap',
            minWidth: 0,
            padding: `${PANEL_PAD}px ${PANEL_PAD}px 0`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              minWidth: 0,
              flex: '1 1 auto',
              overflow: 'hidden',
            }}
          >
            <HeaderTab
              label="Properties"
              active={panelTab === 'properties'}
              onClick={() => setPanelTab('properties')}
            />
            <HeaderTab
              label="Execution Log"
              active={panelTab === 'execution-log'}
              onClick={() => setPanelTab('execution-log')}
            />
            <HeaderTab
              label="Mock Output"
              active={panelTab === 'mock-output'}
              onClick={() => setPanelTab('mock-output')}
            />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              paddingBottom: 6,
            }}
          >
            <button type="button" aria-label="Run step" style={iconBtn}>
              <Play size={15} strokeWidth={1.5} />
            </button>
            <button type="button" aria-label="Duplicate" style={iconBtn}>
              <Copy size={15} strokeWidth={1.5} />
            </button>
            <button type="button" aria-label="Delete" style={iconBtn}>
              <Trash2 size={15} strokeWidth={1.5} />
            </button>
            <button type="button" aria-label="View" style={iconBtn}>
              <Eye size={15} strokeWidth={1.5} />
            </button>
            <button type="button" aria-label="More" style={iconBtn}>
              <MoreHorizontal size={15} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div
          style={{
            height: 1,
            margin: `0 ${PANEL_PAD}px`,
            background: DIVIDER,
          }}
        />
      </header>

      <div
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        {panelTab === 'execution-log' && <ExecutionLogPanel />}
        {panelTab === 'properties' && <PropertiesPlaceholder step={step} />}
        {panelTab === 'mock-output' && (
          <div style={{ padding: PANEL_PAD, fontSize: p1Font.body2, color: p1Text.tertiary }}>
            Mock output editor
          </div>
        )}
      </div>
    </aside>
  );
}

export const WORKFLOW_SIDE_PANEL_W = PANEL_W;
