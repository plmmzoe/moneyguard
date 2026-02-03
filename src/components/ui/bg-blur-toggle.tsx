export default function BGBlur({ toggle }: { toggle: (x: void) => void }) {
  return (
    <button className={'bg-black opacity-90 w-full h-full'} onClick={(_) => toggle()}/>
  );
}
