import '../../styles/login.css';
import { LoginForm } from '@/components/authentication/login-form';

export default function LoginPage() {
  return (
    <div>
      <div className={'flex flex-col'}>
        <div
          className={
            'mx-auto mt-[112px] bg-background/80 w-[343px] md:w-[488px] gap-5 flex-col rounded-lg rounded-b-none login-card-border backdrop-blur-[6px]'
          }
        >
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
