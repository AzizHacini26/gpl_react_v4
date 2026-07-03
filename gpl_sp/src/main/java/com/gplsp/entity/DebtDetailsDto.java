package com.gplsp.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DebtDetailsDto {
    private Integer id;
    private Integer clientId;
    private String clientName;
    private String phone;
    private String amount;
    private String status;
    private String dateInsert;
}
