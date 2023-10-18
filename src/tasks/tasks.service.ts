import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTaskFilterDto } from './dto/get-tasks-filter.dto';
import { TaskRepository } from './tasks.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './tasks.entity';
import { TaskStatus } from './tasks-status.enum';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(TaskRepository)
        private taskRepository: TaskRepository
    ){}

    async getTasks(
        filterDto: GetTaskFilterDto,
        user: User
        ): Promise<Task[]> {
        return await this.taskRepository.getTasks(filterDto, user);
    }

    async getTaskById(
        id: number,
        user: User
        ): Promise<Task> {
        const found = await this.taskRepository.findOne({where: { id, userId: user.id }});
        if (!found) {
            throw new NotFoundException(`Task with ID "${id} not found`);
        }
        return found;
    }

    async createTask(
        createTaskDto: CreateTaskDto, user: User
    ): Promise<Task> {
        return await this.taskRepository.createTask(createTaskDto, user);
    }

    async deleteTaskById(
        id: number,
        user: User
        ): Promise<void> {
        const result = await this.taskRepository.delete({ id, userId: user.id });
        if(result.affected) {
            throw new NotFoundException(`Task with ID "${id} not found`);
        }
    }

    async updateTaskStatus(
        id: number, 
        status: TaskStatus, 
        user: User
    ): Promise<Task> {
        const task = await this.getTaskById(id, user);
        task.status = status;
        await task.save();
        return task;
    }
}
