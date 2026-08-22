import type { UpdateStatus } from './usePwaUpdate';

type GrownUpPanelProps = {
  onClose: () => void;
  status: UpdateStatus;
  statusLabel: string;
  lastChecked: Date | null;
  onCheckForUpdate: () => void;
  onInstallUpdate: () => void;
  onRestartAdventure: () => void;
};

export function GrownUpPanel({
  onClose,
  status,
  statusLabel,
  lastChecked,
  onCheckForUpdate,
  onInstallUpdate,
  onRestartAdventure,
}: GrownUpPanelProps) {
  return (
    <div className="grown-up-backdrop" role="presentation">
      <section
        className="grown-up-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="grown-up-title"
      >
        <button
          className="panel-close"
          type="button"
          onClick={onClose}
          aria-label="Close grown-up settings"
        >
          ×
        </button>
        <p className="panel-kicker">For Gia’s grown-ups</p>
        <h2 id="grown-up-title">Game status</h2>

        <dl className="status-list">
          <div>
            <dt>Version</dt>
            <dd>{__APP_VERSION__}</dd>
          </div>
          <div>
            <dt>Adventure</dt>
            <dd>Moonlight Aquarium · preview 2</dd>
          </div>
          <div>
            <dt>Update status</dt>
            <dd className={`update-status status-${status}`}>
              <span aria-hidden="true" /> {statusLabel}
            </dd>
          </div>
          <div>
            <dt>Last checked</dt>
            <dd>
              {lastChecked
                ? lastChecked.toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                : 'Not yet'}
            </dd>
          </div>
        </dl>

        <p className="update-explanation">
          Updates download only while the tablet is online. The current complete
          adventure stays playable until a new one is ready.
        </p>

        <div className="update-actions">
          <button
            type="button"
            onClick={onCheckForUpdate}
            disabled={status === 'checking' || status === 'updating'}
          >
            Check for updates
          </button>
          {status === 'update-ready' && (
            <button
              className="install-update"
              type="button"
              onClick={onInstallUpdate}
            >
              Install new adventure
            </button>
          )}
        </div>

        <div className="restart-setting">
          <div>
            <h3>Play from the beginning</h3>
            <p>
              Clears this play-through only. The installed game and its settings
              stay safe.
            </p>
          </div>
          <button type="button" onClick={onRestartAdventure}>
            ↻ Restart adventure
          </button>
        </div>
      </section>
    </div>
  );
}
