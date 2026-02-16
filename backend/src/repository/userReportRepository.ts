import type { Topic, Status, UserReport } from "../models/userReport";
import { BaseRepository } from "./baseRepository";

/**
 * TO DO:
 * Get a report by ID
 * Get a report by multiple IDs
 * Get all (with a filter)
 */

class UserReportRepository extends BaseRepository{
    constructor(){
        super({maxRetries: 3, baseDelay: 150}); // try 3 times, 150^#try delay each time
    }

    public async create(data: { //async function called create with param data
        victimUserId: number;
        offenderUserId: number;
        reportTopic: Topic;
        reportDescription?: string | null;
        reportStatus: Status;
    }): Promise<UserReport> { //promise is UserReport type
        return this.executeAsync(
            async () =>{
                return await this.prisma.userReport.create({data});
            }, {deadlineMs: 1000} //run this and get the UserReport type promise within 1000ms. don't wait for me.
        );
    }
    
    public async update(
        id: number,
        data: Partial<Omit<UserReport, "id" | "createdAt" | "updatedAt">>
    ): Promise<UserReport> {
        return this.executeAsync(
            async () => {
                const result = await this.prisma.userReport.update({
                    where: {id}, data: {...data,},
                });
                return result;
            }, {deadlineMs: 1000}
        );
    }

    public async delete(id: number): Promise<null | UserReport> {
        return this.executeAsync(
            async () => {
                return await this.prisma.userReport.delete({where: {id}});
            },{deadlineMs: 1000}
        );
    }

    public async getById(id:number): Promise<UserReport | null>{
        return this.executeAsync(
            async () => {
                return await this.prisma.userReport.findUnique({where: {id}});
            }, {deadlineMs: 1000}
        );
    }

    public async getByMultipleIds(ids: number[]): Promise<UserReport[]>{
        return this.executeAsync(
            async () => {
                return await this.prisma.userReport.findMany({where: {id: {in: ids}}})   
            }, {deadlineMs: 1000}
        );
    }

    public async getAllByFilter(filters: {
        reportTopic?: Topic;
        reportStatus?: Status;
    }): Promise<UserReport[]>{
        const {reportTopic, reportStatus} = filters;
        return this.executeAsync(
            async () => {
                return await this.prisma.userReport.findMany({where: {
                    reportTopic,
                    reportStatus
                }}); 
            }, {deadlineMs: 1000}
        );
    }

}
export {UserReportRepository};