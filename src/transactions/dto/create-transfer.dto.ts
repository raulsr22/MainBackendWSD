export class CreateTransferDto {
  receiverId!: string;
  amount!: number;
  concept!: string;
  serviceId?: string;
}