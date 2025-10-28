import { useTranslation } from 'react-i18next';
import { Data, HeaderWrap } from './StatsHeader.styled';
const StatsHeader = ({ dataFor, stats, boardsCount }) => {
  const { t } = useTranslation();
  const scope = stats?.[dataFor] ?? { number: 0 };

  return (
    <HeaderWrap>
      <h2>{t('stats.header')}</h2>
      <div>
        <h3>
          {dataFor === 'all'
            ? t('stats.youHave')
            : t('stats.hasScope', { scope: dataFor })}
        </h3>
        <Data>
          {dataFor === 'all' && (
            <li>
              {boardsCount ?? 0} {t('stats.boards')}
            </li>
          )}
          <li>
            {scope.number ?? 0} {t('stats.tasks')}
          </li>
        </Data>
      </div>
    </HeaderWrap>
  );
};

export default StatsHeader;
