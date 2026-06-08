'use client';

import { useState } from 'react';
import {
  Code2,
  Copy,
  ExternalLink,
  Info,
  Plus,
  SkipForward,
  Trash2,
} from 'lucide-react';
import type { WorkflowCanvasStep } from './workflowDesignerData';
import { p1Font, p1Text } from './phase1Typography';

const LINE = '#090A0B';
const DIVIDER = '#EBEBEB';

function PanelTab({
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
        padding: '0 0 8px',
        marginRight: 20,
        fontSize: p1Font.body2,
        fontFamily: p1Font.family,
        fontWeight: active ? 600 : 400,
        color: active ? LINE : p1Text.secondary,
        cursor: 'pointer',
        borderBottom: active ? `2px solid ${LINE}` : '2px solid transparent',
      }}
    >
      {label}
    </button>
  );
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: [string, string];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        border: `1px solid ${DIVIDER}`,
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              padding: '6px 12px',
              border: 'none',
              fontSize: p1Font.body2,
              fontFamily: p1Font.family,
              fontWeight: 500,
              cursor: 'pointer',
              background: active ? LINE : '#fff',
              color: active ? '#fff' : LINE,
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
        fontSize: p1Font.body2,
        fontFamily: p1Font.family,
        fontWeight: 500,
        color: LINE,
      }}
    >
      {children}
      <Info size={14} strokeWidth={1.5} color={p1Text.tertiary} />
    </div>
  );
}

function OperatorStepProperties({ step }: { step: WorkflowCanvasStep }) {
  const [runMode, setRunMode] = useState('Autonomous');
  const [onError, setOnError] = useState('Stop workflow');

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          padding: '16px 0',
          borderBottom: `1px solid ${DIVIDER}`,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: step.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 11,
            fontWeight: 700,
            color: '#fff',
          }}
        >
          {step.iconLabel}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: p1Font.body1,
              fontWeight: 600,
              color: LINE,
              marginBottom: 10,
            }}
          >
            {step.title}
          </div>
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 6,
              border: `1px solid ${LINE}`,
              background: '#fff',
              fontSize: p1Font.body2,
              fontFamily: p1Font.family,
              cursor: 'pointer',
              color: LINE,
            }}
          >
            <Copy size={14} strokeWidth={1.5} />
            View execution error
          </button>
        </div>
      </div>

      <div style={{ padding: '16px 0', borderBottom: `1px solid ${DIVIDER}` }}>
        <SectionLabel>Run mode</SectionLabel>
        <SegmentedControl
          options={['Autonomous', 'Supervised']}
          value={runMode}
          onChange={setRunMode}
        />
      </div>

      <div style={{ padding: '16px 0', borderBottom: `1px solid ${DIVIDER}` }}>
        <SectionLabel>On error</SectionLabel>
        <SegmentedControl
          options={['Stop workflow', 'Continue']}
          value={onError}
          onChange={setOnError}
        />
        <p
          style={{
            margin: '10px 0 0',
            fontSize: p1Font.body3,
            color: p1Text.tertiary,
            lineHeight: 1.4,
          }}
        >
          This step failed during the last run. Update configuration or retry from the
          execution log.
        </p>
      </div>

      <div style={{ padding: '16px 0' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: p1Font.body2,
            color: LINE,
            marginBottom: 12,
            cursor: 'pointer',
          }}
        >
          <input type="checkbox" defaultChecked style={{ accentColor: LINE }} />
          Include case context
        </label>
        <div style={{ fontSize: p1Font.body2, fontWeight: 500, color: LINE, marginBottom: 6 }}>
          Agent instructions
        </div>
        <textarea
          defaultValue="Analyze the alert and recommend containment actions."
          rows={3}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: 6,
            border: `1px solid ${DIVIDER}`,
            fontSize: p1Font.body2,
            fontFamily: p1Font.family,
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </>
  );
}

function TriggerStepProperties({ step }: { step: WorkflowCanvasStep }) {
  const [triggeredFrom, setTriggeredFrom] = useState('Anywhere');
  const [concludeWith, setConcludeWith] = useState('Close form');

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          padding: '16px 0',
          borderBottom: `1px solid ${DIVIDER}`,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: '#090A0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 18,
          }}
        >
          ⚡
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: p1Font.body1,
              fontWeight: 600,
              color: LINE,
              marginBottom: 10,
            }}
          >
            {step.title}
          </div>
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 6,
              border: `1px solid ${LINE}`,
              background: '#fff',
              fontSize: p1Font.body2,
              fontFamily: p1Font.family,
              cursor: 'pointer',
              color: LINE,
            }}
          >
            <Copy size={14} strokeWidth={1.5} />
            Copy to use as web form
          </button>
        </div>
      </div>

      <div style={{ padding: '16px 0', borderBottom: `1px solid ${DIVIDER}` }}>
        <SectionLabel>Triggered from</SectionLabel>
        <SegmentedControl
          options={['Anywhere', 'Nested only']}
          value={triggeredFrom}
          onChange={setTriggeredFrom}
        />
      </div>

      <div style={{ padding: '16px 0', borderBottom: `1px solid ${DIVIDER}` }}>
        <SectionLabel>Conclude web form with</SectionLabel>
        <SegmentedControl
          options={['Close form', 'Next form']}
          value={concludeWith}
          onChange={setConcludeWith}
        />
        <p
          style={{
            margin: '10px 0 0',
            fontSize: p1Font.body3,
            color: p1Text.tertiary,
            lineHeight: 1.4,
          }}
        >
          Web form access is for Torq users only. Visit workflow settings to change.
        </p>
      </div>

      <div style={{ padding: '16px 0' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: p1Font.body2,
            color: LINE,
            marginBottom: 12,
            cursor: 'pointer',
          }}
        >
          <input type="checkbox" defaultChecked style={{ accentColor: LINE }} />
          Expose in cases
        </label>
        <div style={{ fontSize: p1Font.body2, fontWeight: 500, color: LINE, marginBottom: 6 }}>
          Form name
        </div>
        <input
          type="text"
          defaultValue="I'm text"
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: 6,
            border: `1px solid ${DIVIDER}`,
            fontSize: p1Font.body2,
            fontFamily: p1Font.family,
            boxSizing: 'border-box',
          }}
        />
      </div>
    </>
  );
}

export function Phase1WorkflowStepPropertiesPanel({ step }: { step: WorkflowCanvasStep }) {
  const [headerTab, setHeaderTab] = useState<'properties' | 'execution-log'>('properties');
  const [footerTab, setFooterTab] = useState<'parameters' | 'event-preview'>('parameters');

  const iconBtn: React.CSSProperties = {
    border: 'none',
    background: 'transparent',
    padding: 6,
    cursor: 'pointer',
    color: LINE,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <aside
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        bottom: 16,
        width: 380,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #EBEBEB',
        boxShadow: '0 4px 24px rgba(9, 10, 11, 0.08), 0 1px 3px rgba(9, 10, 11, 0.06)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '14px 16px 0', flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${DIVIDER}`,
            paddingBottom: 0,
          }}
        >
          <div style={{ display: 'flex' }}>
            <PanelTab
              label="Properties"
              active={headerTab === 'properties'}
              onClick={() => setHeaderTab('properties')}
            />
            <PanelTab
              label="Execution Log"
              active={headerTab === 'execution-log'}
              onClick={() => setHeaderTab('execution-log')}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: -4 }}>
            <button type="button" aria-label="Step into" style={iconBtn}>
              <SkipForward size={16} strokeWidth={1.5} />
            </button>
            <button type="button" aria-label="Open in new" style={iconBtn}>
              <ExternalLink size={16} strokeWidth={1.5} />
            </button>
            <button type="button" aria-label="Delete step" style={iconBtn}>
              <Trash2 size={16} strokeWidth={1.5} />
            </button>
            <button type="button" aria-label="View code" style={iconBtn}>
              <Code2 size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {headerTab === 'properties' ? (
          step.kind === 'trigger' ? (
            <TriggerStepProperties step={step} />
          ) : (
            <OperatorStepProperties step={step} />
          )
        ) : (
          <div
            style={{
              padding: '24px 0',
              fontSize: p1Font.body2,
              color: p1Text.tertiary,
              textAlign: 'center',
            }}
          >
            Execution log for {step.title}
          </div>
        )}
      </div>

      <div
        style={{
          flexShrink: 0,
          borderTop: `1px solid ${DIVIDER}`,
          padding: '10px 16px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex' }}>
          <PanelTab
            label="Parameters"
            active={footerTab === 'parameters'}
            onClick={() => setFooterTab('parameters')}
          />
          <PanelTab
            label="Event Preview"
            active={footerTab === 'event-preview'}
            onClick={() => setFooterTab('event-preview')}
          />
        </div>
        <button
          type="button"
          aria-label="Add parameter"
          style={iconBtn}
        >
          <Plus size={18} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}
