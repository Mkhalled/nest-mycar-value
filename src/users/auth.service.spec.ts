import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entitie';
import { UsersService } from './users.service';


describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users:User[] =[];
    // Create a fake copy of the users service
    fakeUsersService = {
      find: (email:string) => {
        const filterUsers=users.filter(user=>user.email=== email);
        return Promise.resolve(filterUsers);
      },
      createUser: (email: string, password: string) =>{
        const user={id:users.length,email,password} as User;
        users.push(user) ;
        return  Promise.resolve(user)

      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([{ id: 1, email: 'a', password: '1' } as User]);
      expect.assertions(2);
      try {
        await service.signup('a@a.pl', 'pass');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toBe('email in use');
      }
  
  
    });

  it('throws if signin is called with an unused email', async () => {

    expect.assertions(2);
    try {
      await service.signin('asdflkj@asffdlfkj.com', 'passdflkj');
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException);
      expect(err.message).toBe('user not found');
    }

  
  });

  it('throws if an invalid password is provided', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([
        { email: 'asdf@asdf.com', password: 'laskdjf' } as User,
      ]);
    try {
      await service.signin('laskdjf@alskdfj.com', 'passowrd');
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
      expect(err.message).toBe('bad password');
    }
  });

  it('returns a user if correct password is provided', async () => {
    // fakeUsersService.find = () =>
    //   Promise.resolve([
    //     {
    //       email: 'asdf@asdf.com',
    //       password:
    //         '1f3f1f78b727fa56.af7186ab0d0a8e9cf1ae2c5c179784947a2fe349d3a3e82f6422c0d7cbc2f925',
    //     } as User,
    //   ]);
    await service.signup('asdf@asdf.com', 'mypassword');

    const user = await service.signin('asdf@asdf.com', 'mypassword');
    expect(user).toBeDefined();
  });
});
