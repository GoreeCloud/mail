import { localized, React } from 'mailspring-exports';
import * as OnboardingActions from './onboarding-actions';

const Steps = [
  {
    seen: false,
    id: 'people',
    title: localized('Work across your accounts'),
    image: 'feature-people@2x.png',
    description: localized(
      'Bring multiple providers into one focused inbox while keeping each account and its credentials isolated.'
    ),
    x: 96.6,
    y: 1.3,
    xDot: 93.5,
    yDot: 5.4,
  },
  {
    seen: false,
    id: 'activity',
    title: localized('Read with privacy by default'),
    image: 'feature-activity@2x.png',
    description: localized(
      'Remote message images are blocked by default so reading email does not silently disclose activity to third-party tracking resources.'
    ),
    x: 12.8,
    y: 1,
    xDot: 15,
    yDot: 5.1,
  },
  {
    seen: false,
    id: 'snooze',
    title: localized('Send on your own schedule'),
    image: 'feature-snooze@2x.png',
    description: localized(
      'Snooze messages and schedule work around your day while GoreeCloud Mail preserves provider-aware and offline-capable behavior.'
    ),
    x: 5.5,
    y: 23.3,
    xDot: 10,
    yDot: 25.9,
  },
  // {
  //   seen: false,
  //   id: 'composer',
  //   title: 'Eliminate hacky extensions',
  //   image: 'feature-composer@2x.png',
  //   description: "Embed calendar invitations, propose meeting times, use quick reply templates, send mass emails with mail merge, and more—all directly from Mailspring’s powerful composer.",
  //   x: 60.95,
  //   y: 66,
  //   xDot: 60.3,
  //   yDot: 65.0,
  // },
];

export default class TutorialPage extends React.Component<
  Record<string, unknown>,
  { appeared: boolean; seen: any[]; current: any }
> {
  static displayName = 'TutorialPage';

  _timer: NodeJS.Timeout;

  constructor(props) {
    super(props);

    this.state = {
      appeared: false,
      seen: [],
      current: Steps[0],
    };
  }

  componentDidMount() {
    this._timer = setTimeout(() => {
      this.setState({ appeared: true });
    }, 200);
  }

  componentWillUnmount() {
    clearTimeout(this._timer);
  }

  _onBack = () => {
    const nextItem = this.state.seen.pop();
    if (!nextItem) {
      OnboardingActions.moveToPreviousPage();
    } else {
      this.setState({ current: nextItem });
    }
  };

  _onNextUnseen = () => {
    const nextSeen = [...this.state.seen, this.state.current];
    const nextItem = Steps.find((s) => !nextSeen.includes(s));
    if (nextItem) {
      this.setState({ current: nextItem, seen: nextSeen });
    } else {
      OnboardingActions.moveToPage('account-choose');
    }
  };

  _onMouseOverOverlay = (event: React.MouseEvent<HTMLElement>) => {
    const item = Steps.find((i) => i.id === (event.target as HTMLElement).id);
    if (item) {
      if (!this.state.seen.includes(item)) {
        this.state.seen.push(item);
      }
      this.setState({ current: item });
    }
  };

  render() {
    const { current, seen, appeared } = this.state;

    return (
      <div className={`page tutorial appeared-${appeared}`}>
        <div className="tutorial-container">
          <div className="left">
            <div className="screenshot">
              {Steps.map((step) => (
                <div
                  key={step.id}
                  id={step.id}
                  className={`overlay ${seen.includes(step) ? 'seen' : ''} ${
                    current === step ? 'expanded' : ''
                  }`}
                  style={{ left: `${step.xDot}%`, top: `${step.yDot}%` }}
                  onMouseOver={this._onMouseOverOverlay}
                >
                  <div
                    className="overlay-content"
                    style={{ backgroundPosition: `${step.x}% ${step.y}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="right">
            <img
              src={`mailspring://onboarding/assets/${current.image}`}
              style={{ zoom: 0.5, margin: 'auto' }}
              alt=""
            />
            <h2>{current.title}</h2>
            <p>{current.description}</p>
          </div>
        </div>
        <div className="footer">
          <button key="prev" className="btn btn-large btn-prev" onClick={this._onBack}>
            {localized('Back')}
          </button>
          <button key="next" className="btn btn-large btn-next" onClick={this._onNextUnseen}>
            {seen.length < Steps.length ? localized('Next') : localized('Get Started')}
          </button>
        </div>
      </div>
    );
  }
}