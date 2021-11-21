import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entitie';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let fackUsersService:Partial<UsersService>;
  let fakeAuthService:Partial<AuthService>;

  beforeEach(async () => {

    fackUsersService={

    
findOne:(id: number)=>{
  return Promise.resolve({id:id,email:"azert@azert.com",password:"test"} as User);
},
// createUser:(email: string, password: string)=>{
//   return Promise.resolve({id:1,email,password} as User);
// },
find:(email: string)=>{
  return Promise.resolve([{id:1,email:"azert@azert.com",password:"test"} as User]);
},
// update:(id: number, attrs: Partial<User>)=>{
//   return Promise.resolve({id:id,email:"azert@azert.com",password:"test"} as User);
// },
// remove:(id: number)=>{
//   return Promise.resolve({id:id,email:"azert@azert.com",password:"test"} as User);
// },

    };

    fakeAuthService={
          // signup:()=>{},
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers:[
        {
          provide : UsersService,
          useValue:fackUsersService
        },
        {
          provide : AuthService,
          useValue:fakeAuthService
        },
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it("findAllUsers returns a list of users with the given email",async()=>{
    const users=await controller.findAllUsers('azert@azert.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('azert@azert.com');

  });

  it("findUser return a single user with the given Id",async()=>{
    const user=await controller.findUser('2');
    expect(user).toBeDefined();
  });

  it("findUser throws an error if user with the given id not found",async()=>{

    fackUsersService={
      findOne:(id: number)=>{
        return Promise.resolve(null);
      },
    }
    await expect( controller.findUser('1')).rejects.toThrow()
    // try {
    //  const user= ;
    
    // } catch (err) {

    // //  expect(err).toBeInstanceOf(BadRequestException);
    // //   expect(err.message).toBe('user not found');
    // }
  });

  it('signin updates session object and returns user', async () => {
    const session = { userId: -10 };
    const user = await controller.signin(
      { email: 'asdf@asdf.com', password: 'asdf' },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
