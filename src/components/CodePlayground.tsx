import React, { useState } from 'react';
import { Play, RotateCcw, Check, Terminal as TerminalIcon, Sparkles } from 'lucide-react';

interface CodeSnippet {
  id: string;
  name: string;
  lang: string;
  code: string;
  output: string[];
}

const SNIPPETS: CodeSnippet[] = [
  {
    id: 'py',
    name: 'neural_net.py',
    lang: 'Python / PyTorch',
    code: `import torch
import torch.nn as nn

# Linear Model + SGD Optimizer
model = nn.Sequential(
    nn.Linear(4, 16),
    nn.ReLU(),
    nn.Linear(16, 1)
)

criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

# Training batch tensor
X = torch.randn(32, 4)
y = torch.randn(32, 1)

optimizer.zero_grad()
loss = criterion(model(X), y)
loss.backward()
optimizer.step()`,
    output: [
      '[PyTorch 2.4.0 CUDA Active]',
      '>>> Forward pass: Batch size 32, features 4',
      '>>> Initial loss: 1.4820',
      '>>> Backward pass: Gradients computed successfully',
      '>>> Optimizer step: Weights updated (104 parameters)',
      '>>> Convergence reached in 0.018s ✓',
    ],
  },
  {
    id: 'c',
    name: 'pointers.c',
    lang: 'C (Systems)',
    code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int capacity = 5;
    int *buffer = (int*)malloc(capacity * sizeof(int));
    
    printf("Allocated heap memory at: %p\\n", (void*)buffer);
    
    for (int i = 0; i < capacity; i++) {
        *(buffer + i) = (i + 1) * 10;
        printf("Addr: %p | Val: %d\\n", (void*)(buffer + i), *(buffer + i));
    }
    
    free(buffer);
    return 0;
}`,
    output: [
      '[GCC 14.1 -std=c17 compiled]',
      'Allocated heap memory at: 0x7fff5fbff820',
      'Addr: 0x7fff5fbff820 | Val: 10',
      'Addr: 0x7fff5fbff824 | Val: 20',
      'Addr: 0x7fff5fbff828 | Val: 30',
      'Addr: 0x7fff5fbff82c | Val: 40',
      'Addr: 0x7fff5fbff830 | Val: 50',
      '>>> Clean memory free() invoked without leaks ✓',
    ],
  },
  {
    id: 'js',
    name: 'event_loop.js',
    lang: 'JavaScript / Node',
    code: `console.log('1: Synchronous start');

setTimeout(() => {
    console.log('4: Macrotask timeout executed');
}, 0);

Promise.resolve().then(() => {
    console.log('3: Microtask promise resolved');
});

console.log('2: Synchronous end');`,
    output: [
      '[Node.js V8 Runtime]',
      '1: Synchronous start',
      '2: Synchronous end',
      '3: Microtask promise resolved (Microtask queue drained)',
      '4: Macrotask timeout executed (Event loop tick)',
      '>>> Process exited with code 0 ✓',
    ],
  },
];

export const CodePlayground: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('py');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>(SNIPPETS[0].output);
  const [copied, setCopied] = useState<boolean>(false);

  const currentSnippet = SNIPPETS.find((s) => s.id === activeTab) || SNIPPETS[0];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const snip = SNIPPETS.find((s) => s.id === tabId);
    if (snip) {
      setTerminalLogs(snip.output);
    }
  };

  const handleRun = () => {
    setIsRunning(true);
    setTerminalLogs(['[Executing compiler pipeline...]']);
    setTimeout(() => {
      setTerminalLogs(currentSnippet.output);
      setIsRunning(false);
    }, 450);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-indigo-500/5 transition-all">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
            rishu@ai-ml-lab:~
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            title="Copy code"
            className="px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors flex items-center gap-1"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">Copied</span>
              </>
            ) : (
              <span>Copy</span>
            )}
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className={`w-3 h-3 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running' : 'Run'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 overflow-x-auto">
        {SNIPPETS.map((snip) => {
          const isActive = activeTab === snip.id;
          return (
            <button
              key={snip.id}
              onClick={() => handleTabChange(snip.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-mono border-r border-zinc-200 dark:border-zinc-800 transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 font-semibold border-t-2 border-t-indigo-600'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <span>{snip.name}</span>
            </button>
          );
        })}
      </div>

      {/* Code Area */}
      <div className="p-4 bg-zinc-950 font-mono text-[13px] leading-relaxed text-zinc-300 overflow-x-auto min-h-[220px]">
        <pre className="text-zinc-300">
          <code>
            {currentSnippet.code.split('\n').map((line, idx) => (
              <div key={idx} className="flex">
                <span className="w-6 shrink-0 text-zinc-600 select-none text-right pr-3 font-mono text-xs">
                  {idx + 1}
                </span>
                <span className="whitespace-pre">
                  {line.startsWith('#') || line.startsWith('//') ? (
                    <span className="text-zinc-500 italic">{line}</span>
                  ) : line.includes('import') || line.includes('include') || line.includes('return') ? (
                    <span className="text-purple-400">{line}</span>
                  ) : line.includes('int') || line.includes('const') || line.includes('let') || line.includes('def') ? (
                    <span className="text-indigo-400">{line}</span>
                  ) : line.includes('printf') || line.includes('console.log') || line.includes('print') ? (
                    <span className="text-amber-300">{line}</span>
                  ) : (
                    line
                  )}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>

      {/* Embedded Terminal Output */}
      <div className="border-t border-zinc-800 bg-zinc-950/95 p-3.5 font-mono text-xs">
        <div className="flex items-center justify-between text-zinc-500 pb-2 mb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <TerminalIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Output Console</span>
          </div>
          <span className="text-[11px] text-zinc-500">{currentSnippet.lang}</span>
        </div>
        <div className="space-y-1 text-zinc-300">
          {terminalLogs.map((log, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 ${
                log.includes('✓') ? 'text-emerald-400' : log.includes('Executing') ? 'text-indigo-400' : 'text-zinc-300'
              }`}
            >
              <span className="text-zinc-600 select-none">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
