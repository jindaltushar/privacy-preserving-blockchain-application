import cn from 'classnames';
import { Button } from './ui/button';
import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { FieldValues, UseFormTrigger } from 'react-hook-form';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { currentFormIndexAtom, formAtom } from '@/stores/atoms';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa6';

export function FormButton({
  className,
  children,
  type,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      type="button"
      size="lg"
      className={cn('text-xl', className)}
      {...rest}
    >
      {children}
    </Button>
  );
}

export function SubmitButton() {
  return (
    <Button size="lg" className="text-xl" type="submit">
      Submit
    </Button>
  );
}

export function NavigateButtons({
  trigger,
}: {
  trigger: UseFormTrigger<FieldValues>;
}) {
  const [currentIndex, setCurrentIndex] = useRecoilState(currentFormIndexAtom);
  const nodes = useRecoilValue(formAtom);

  const handleUp = () => {
    if (currentIndex <= 0 || currentIndex >= nodes.length) return;
    trigger(`${currentIndex}.value`, { shouldFocus: true }).then((success) => {
      if (success) {
        document.getElementById(`target-${currentIndex - 1}`)?.scrollIntoView();
        setCurrentIndex(currentIndex - 1);
      }
    });
  };
  const handleDown = () => {
    if (currentIndex < 0 || currentIndex >= nodes.length - 1) return;
    trigger(`${currentIndex}.value`, { shouldFocus: true }).then((success) => {
      if (success) {
        document.getElementById(`target-${currentIndex + 1}`)?.scrollIntoView();
        setCurrentIndex(currentIndex + 1);
      }
    });
  };
  // w-[100dvw]
  return (
    <div className="fixed bottom-0 right-0 translate-y-[-100%] flex gap-2 justify-end px-8 py-8">
      <Button type="button" size="icon" onClick={handleUp}>
        <FaChevronUp />
      </Button>
      <Button type="button" size="icon" onClick={handleDown}>
        <FaChevronDown />
      </Button>
    </div>
  );
}

export function SubmitSection({
  index,
  isSubmitVisible,
  trigger,
}: {
  index: number;
  isSubmitVisible: boolean;
  trigger: UseFormTrigger<FieldValues>;
}) {
  const setCurrentIndex = useSetRecoilState(currentFormIndexAtom);
  return (
    <div className="flex items-center gap-4">
      {isSubmitVisible ? (
        <SubmitButton />
      ) : (
        <React.Fragment>
          <FormButton
            type="button"
            className="text-xl"
            onClick={() => {
              trigger(`${index}.value`, { shouldFocus: true }).then(
                (success) => {
                  if (success) {
                    document
                      .getElementById(`target-${index + 1}`)
                      ?.scrollIntoView();
                    setCurrentIndex(index + 1);
                  }
                },
              );
            }}
          >
            Next
          </FormButton>
          <p>
            Press <b>↵ Enter</b>
          </p>
        </React.Fragment>
      )}
    </div>
  );
}

export function FormAlert({ message }: { message?: string }) {
  return (
    <React.Fragment>
      {message && (
        <Alert variant="destructive" className="bg-red-50">
          <AlertDescription className="text-md font-medium">
            {message}
          </AlertDescription>
        </Alert>
      )}
    </React.Fragment>
  );
}
