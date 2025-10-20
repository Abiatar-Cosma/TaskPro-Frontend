import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { addCard, editCard } from '../../../redux/cards/cardsOperations';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { LABEL_ARR, TOASTER_CONFIG } from 'constants';
import {
  makeValidDate,
  validateInputMaxLength,
  isTheDateLessThanNow,
} from 'helpers';
import { validateCardData } from 'helpers/cardHelpers';
import ModalWrapper from 'components/Modals/ModalWrapper';
import Calendar from 'components/Calendar';
import Plus from 'components/Icons/Plus';
import {
  CardModalContent,
  CardForm,
  ErrorLabel,
  LabelRadioList,
  RadioBtn,
  LabelRadioLabel,
  CalendarContainer,
  SubmitBtn,
} from './CardModal.styled';

const CardModal = ({ columnId, variant, closeCardModal, activeCard }) => {
  const [cardPriority, setCardPriority] = useState(
    variant === 'add' ? 'without priority' : activeCard.priority
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDay] = useState(
    variant === 'add'
      ? new Date()
      : (activeCard?.deadline || activeCard?.dueDate
          ? new Date(activeCard.deadline || activeCard.dueDate)
          : new Date())
  );
  const [errorMsgShown, setErrorMsgShown] = useState(false);
  const [errorClassName, setErrorClassName] = useState('');

  const datePickerRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const { boardId } = useParams();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { title, description } = e.target.elements;

    const rawCard = {
      title: title.value.trim(),
      description: description.value.trim(),
      priority: cardPriority,
      // UI păstrează "deadline"; thunk-urile convertesc la dueDate înaintea API-ului
      deadline: makeValidDate(selectedDate),
      column: columnId,
      board: boardId,
    };

    // validări de bază
    const { isValid, error } = validateCardData(rawCard);
    if (!isValid) {
      toast.error(error, TOASTER_CONFIG);
      return;
    }

    if (isTheDateLessThanNow(rawCard.deadline)) {
      toast.error(t('cards.modals.toast.invalidDate'), TOASTER_CONFIG);
      return;
    }

    try {
      if (variant === 'add') {
        await dispatch(addCard(rawCard)).unwrap();
        toast.success(t('cards.modals.toast.add.success'), TOASTER_CONFIG);
      } else {
        await dispatch(
          editCard({ cardId: activeCard._id, editedCard: rawCard })
        ).unwrap();
        toast.success(t('cards.modals.toast.edit.success'), TOASTER_CONFIG);
      }
      closeCardModal();
    } catch (err) {
      const msg =
        typeof err === 'string'
          ? err
          : err?.message || t('cards.modals.toast.error');
      toast.error(msg, TOASTER_CONFIG);
    }
  };

  const openDatePicker = () => datePickerRef.current?.setOpen(true);
  const closeDatePicker = () => datePickerRef.current?.setOpen(false);

  return (
    <ModalWrapper width={350} onClose={closeCardModal}>
      <CardModalContent>
        <p>
          {variant === 'add'
            ? t('cards.modals.addTitle')
            : t('cards.modals.editTitle')}
        </p>

        <CardForm onSubmit={handleFormSubmit}>
          <ErrorLabel>
            <input
              className={errorClassName}
              ref={titleRef}
              type="text"
              name="title"
              placeholder={t('cards.modals.title')}
              defaultValue={variant === 'add' ? '' : activeCard.title}
              autoComplete="off"
              maxLength={25}
              onChange={(ev) =>
                validateInputMaxLength(ev, setErrorMsgShown, setErrorClassName)
              }
            />
            {errorMsgShown && <p>{t('toast.maxTitle')}</p>}
          </ErrorLabel>

          <textarea
            name="description"
            placeholder={t('cards.modals.description')}
            defaultValue={variant === 'add' ? '' : activeCard.description}
            autoComplete="off"
          />

          <label>
            {t('cards.modals.label')}
            <LabelRadioList>
              {LABEL_ARR.map(({ id, priority, color }) => (
                <li key={id}>
                  <RadioBtn
                    $color={color}
                    id={`priority-${id}`}
                    type="radio"
                    name="priority"
                    value={priority}
                    checked={priority === cardPriority}
                    onChange={(e) => setCardPriority(e.target.value)}
                  />
                  <LabelRadioLabel htmlFor={`priority-${id}`} $color={color} />
                </li>
              ))}
            </LabelRadioList>
          </label>

          <label>{t('cards.modals.deadline')}</label>

          <CalendarContainer>
            {isCalendarOpen ? (
              <button type="button" onClick={closeDatePicker}>
                <IoIosArrowUp />
              </button>
            ) : (
              <button type="button" onClick={openDatePicker}>
                <IoIosArrowDown />
              </button>
            )}

            <Calendar
              selectedDate={selectedDate}
              setDate={setSelectedDay}
              toggleCalendar={setIsCalendarOpen}
              ref={datePickerRef}
            />
          </CalendarContainer>

          <SubmitBtn type="submit">
            <span>
              <Plus width={14} height={14} />
            </span>
            {variant === 'add'
              ? t('cards.modals.addButton')
              : t('cards.modals.editButton')}
          </SubmitBtn>
        </CardForm>
      </CardModalContent>
    </ModalWrapper>
  );
};

export default CardModal;
