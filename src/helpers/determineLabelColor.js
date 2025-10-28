import { LABEL_ARR } from 'constants';

const determineLabelColor = priority => {
  const obj = LABEL_ARR.find(el => el.priority === priority);
  return obj?.color ?? '#9aa0a6';
};

export default determineLabelColor;
